import { BookOutlined, HomeOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Select, Space, Spin, message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  type BedOptionDto,
  type RoomGridItemDto,
  getBedOptions,
  getRoomGrid
} from "../services/allocationService";
import { hostelService } from "../services/hostelService";
import { useAllotmentStore } from "../store/allotmentStore";
import type { Bhavana, Block, Floor, Hostel } from "../types";
import "./room-allotment-step2.css";
import "./room-allotment-wizard.css";

const ALL = "__all__";

type TupleResolved = {
  hostel: Hostel;
  bhavana: Bhavana;
  block: Block;
  floor: Floor;
};

const formatRoomTypeLabel = (type: number): string => {
  const n = Number(type) || 0;
  return `${n} Bedded Bunker`;
};

const expandTuples = (hostels: Hostel[], hostelId: string, bhavanaId: string, blockId: string, floorNumber: string): TupleResolved[] => {
  const out: TupleResolved[] = [];
  const hostelsFiltered = hostelId === ALL ? hostels : hostels.filter((h) => h.id === hostelId);
  for (const hostel of hostelsFiltered) {
    const bhavs =
      bhavanaId === ALL ? hostel.bhavanAs : hostel.bhavanAs.filter((b) => b.bhavanaId === bhavanaId);
    for (const bhavana of bhavs) {
      const blocks = blockId === ALL ? bhavana.blocks : bhavana.blocks.filter((b) => b.blockId === blockId);
      for (const block of blocks) {
        const floors =
          floorNumber === ALL ? block.floors : block.floors.filter((f) => f.floorNumber === floorNumber);
        for (const floor of floors) {
          out.push({ hostel, bhavana, block, floor });
        }
      }
    }
  }
  return out;
};

type RoomCellModel = RoomGridItemDto & {
  hostelId: string;
  bhavanaId: string;
  blockId: string;
  floorNumber: string;
};

type GridSectionModel = {
  key: string;
  hBadge: string;
  bBadge: string;
  floorTitle: string;
  roomTypeLabel: string;
  rooms: RoomCellModel[];
};

const RoomAllotmentStep2SelectRoomPage = () => {
  const navigate = useNavigate();
  const student = useAllotmentStore((s) => s.student);
  const roomIdStored = useAllotmentStore((s) => s.roomId);
  const setRoomSelection = useAllotmentStore((s) => s.setRoomSelection);
  const clearRoomSelection = useAllotmentStore((s) => s.clearRoomSelection);

  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [hostelId, setHostelId] = useState<string>(ALL);
  const [bhavanaId, setBhavanaId] = useState<string>(ALL);
  const [blockId, setBlockId] = useState<string>(ALL);
  const [floorNumber, setFloorNumber] = useState<string>(ALL);
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>(ALL);
  const [roomSearchInput, setRoomSearchInput] = useState("");
  const [roomSearch, setRoomSearch] = useState("");

  const [sections, setSections] = useState<GridSectionModel[]>([]);
  const [gridLoading, setGridLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [bedOptions, setBedOptions] = useState<BedOptionDto[]>([]);
  const [modalRoom, setModalRoom] = useState<RoomCellModel | null>(null);
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [selectLoading, setSelectLoading] = useState(false);

  useEffect(() => {
    if (!student) {
      navigate("/room-allotment/new", { replace: true });
    }
  }, [student, navigate]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await hostelService.getAll();
        setHostels(data);
      } catch {
        message.error("Failed to load hostels.");
      }
    };
    void load();
  }, []);

  const hostelOptions = useMemo(
    () => [{ value: ALL, label: "All" }, ...hostels.map((h) => ({ value: h.id, label: h.name }))],
    [hostels]
  );

  const blockOptions = useMemo(() => {
    const blocks: Block[] = [];
    const hostelsPart = hostelId === ALL ? hostels : hostels.filter((h) => h.id === hostelId);
    for (const h of hostelsPart) {
      const bhavs = bhavanaId === ALL ? h.bhavanAs : h.bhavanAs.filter((b) => b.bhavanaId === bhavanaId);
      for (const b of bhavs) {
        blocks.push(...b.blocks);
      }
    }
    const uniq = new Map(blocks.map((b) => [b.blockId, b]));
    const list = [...uniq.values()];
    return [
      { value: ALL, label: "All" },
      ...list.map((b, i) => ({ value: b.blockId, label: `Block ${String.fromCharCode(65 + (i % 26))}` }))
    ];
  }, [hostels, hostelId, bhavanaId]);

  const floorOptions = useMemo(() => {
    const floors: Floor[] = [];
    const hostelsPart = hostelId === ALL ? hostels : hostels.filter((h) => h.id === hostelId);
    for (const h of hostelsPart) {
      const bhavs = bhavanaId === ALL ? h.bhavanAs : h.bhavanAs.filter((b) => b.bhavanaId === bhavanaId);
      for (const bh of bhavs) {
        const blks = blockId === ALL ? bh.blocks : bh.blocks.filter((b) => b.blockId === blockId);
        for (const bl of blks) {
          floors.push(...bl.floors);
        }
      }
    }
    const seen = new Set<string>();
    const uniq: Floor[] = [];
    for (const f of floors) {
      if (!seen.has(f.floorNumber)) {
        seen.add(f.floorNumber);
        uniq.push(f);
      }
    }
    uniq.sort((a, b) => a.floorNumber.localeCompare(b.floorNumber, undefined, { numeric: true }));
    return [
      { value: ALL, label: "All" },
      ...uniq.map((f) => ({ value: f.floorNumber, label: `Floor ${f.floorNumber}` }))
    ];
  }, [hostels, hostelId, bhavanaId, blockId]);

  const loadGrid = useCallback(async () => {
    if (hostels.length === 0) {
      setSections([]);
      return;
    }
    const tuples = expandTuples(hostels, hostelId, bhavanaId, blockId, floorNumber);
    if (tuples.length === 0) {
      setSections([]);
      return;
    }
    const roomTypeParam =
      roomTypeFilter === ALL ? undefined : Number.parseInt(roomTypeFilter, 10);

    setGridLoading(true);
    try {
      const built: GridSectionModel[] = [];
      for (let i = 0; i < tuples.length; i += 1) {
        const t = tuples[i];
        const hOrd = hostels.findIndex((h) => h.id === t.hostel.id) + 1;
        const bOrd = t.bhavana.blocks.findIndex((b: Block) => b.blockId === t.block.blockId) + 1;
        const hBadge = `H${hOrd}`;
        const bBadge = `B${bOrd}`;
        const floorTitle = `Floor No. ${String(t.floor.floorNumber).padStart(2, "0")}`;

        const raw = await getRoomGrid({
          hostelId: t.hostel.id,
          bhavanaId: t.bhavana.bhavanaId,
          blockId: t.block.blockId,
          floorNumber: t.floor.floorNumber,
          roomType: roomTypeParam
        });

        const rooms: RoomCellModel[] = raw.map((r) => ({
          ...r,
          hostelId: t.hostel.id,
          bhavanaId: t.bhavana.bhavanaId,
          blockId: t.block.blockId,
          floorNumber: t.floor.floorNumber
        }));

        const first = rooms[0];
        const roomTypeLabel = first ? formatRoomTypeLabel(first.type) : "";

        built.push({
          key: `${t.hostel.id}-${t.bhavana.bhavanaId}-${t.block.blockId}-${t.floor.floorNumber}-${i}`,
          hBadge,
          bBadge,
          floorTitle,
          roomTypeLabel,
          rooms
        });
      }
      setSections(built);
    } catch {
      message.error("Failed to load room grid.");
      setSections([]);
    } finally {
      setGridLoading(false);
    }
  }, [hostels, hostelId, bhavanaId, blockId, floorNumber, roomTypeFilter]);

  useEffect(() => {
    void loadGrid();
  }, [loadGrid]);

  useEffect(() => {
    clearRoomSelection();
  }, [hostelId, bhavanaId, blockId, floorNumber, roomTypeFilter, clearRoomSelection]);

  const filteredSections = useMemo(() => {
    const q = roomSearch.trim().toLowerCase();
    if (!q) {
      return sections;
    }
    return sections
      .map((sec) => ({
        ...sec,
        rooms: sec.rooms.filter((r) => (r.roomNumber ?? "").toLowerCase().includes(q))
      }))
      .filter((sec) => sec.rooms.length > 0);
  }, [sections, roomSearch]);

  const openBedModal = async (room: RoomCellModel) => {
    if (room.status !== "AVAILABLE") {
      return;
    }
    setModalRoom(room);
    setSelectedBedId(null);
    setModalOpen(true);
    setModalLoading(true);
    try {
      const beds = await getBedOptions(room.roomId);
      setBedOptions(beds);
      const firstVacant = beds.find((b) => b.status === "VACANT");
      if (firstVacant) {
        setSelectedBedId(firstVacant.bedId);
      }
    } catch {
      message.error("Failed to load beds.");
      setModalOpen(false);
      setModalRoom(null);
    } finally {
      setModalLoading(false);
    }
  };

  const confirmBed = async () => {
    if (!modalRoom || !selectedBedId) {
      message.error("Select a bed.");
      return;
    }
    const bed = bedOptions.find((b) => b.bedId === selectedBedId);
    if (!bed || bed.status !== "VACANT") {
      message.error("Select an available bed.");
      return;
    }
    setSelectLoading(true);
    try {
      const hOrd = hostels.findIndex((h) => h.id === modalRoom.hostelId) + 1;
      const hostel = hostels.find((h) => h.id === modalRoom.hostelId);
      const bhavana = hostel?.bhavanAs.find((b) => b.bhavanaId === modalRoom.bhavanaId);
      const bOrd = bhavana ? bhavana.blocks.findIndex((b: Block) => b.blockId === modalRoom.blockId) + 1 : 1;
      const tagH = `H${hOrd}`;
      const tagB = `B${bOrd}`;
      const tagFloor = `Floor No. ${String(modalRoom.floorNumber).padStart(2, "0")}`;
      setRoomSelection({
        hostelId: modalRoom.hostelId,
        bhavanaId: modalRoom.bhavanaId,
        blockId: modalRoom.blockId,
        floorNumber: modalRoom.floorNumber,
        roomId: modalRoom.roomId,
        bedId: bed.bedId,
        roomNumber: modalRoom.roomNumber ?? "",
        bedName: bed.bedName ?? bed.bedId,
        tagH,
        tagB,
        tagFloor,
        roomType: modalRoom.type
      });
      setModalOpen(false);
      setModalRoom(null);
    } finally {
      setSelectLoading(false);
    }
  };

  const onNext = () => {
    const st = useAllotmentStore.getState();
    if (
      !st.hostelId ||
      !st.bhavanaId ||
      !st.blockId ||
      !st.floorNumber ||
      !st.roomId ||
      !st.bedId
    ) {
      message.error("Select a room and bed to continue.");
      return;
    }
    navigate("/room-allotment/new/review");
  };

  if (!student) {
    return null;
  }

  return (
    <div className="room-allotment-wizard-step-body room-allotment-step2">
      <div className="room-allotment-step2-meta">
        <span className="room-allotment-step2-allotting">
          Allotting room for{" "}
          <strong>
            {student.name} {student.rollNumber}
          </strong>
        </span>
        <span className="room-allotment-step2-meta-right">
          {student.name}&nbsp;&nbsp;{student.rollNumber}
        </span>
      </div>

      <div className="room-allotment-step2-filters">
        <Space wrap size={[12, 8]} align="center">
          <span className="room-allotment-step2-filter-label">Hostel</span>
          <Select
            size="small"
            value={hostelId}
            options={hostelOptions}
            className="room-allotment-step2-select"
            onChange={(v) => {
              setHostelId(v);
              setBhavanaId(ALL);
              setBlockId(ALL);
              setFloorNumber(ALL);
            }}
          />
          <span className="room-allotment-step2-filter-label">Block</span>
          <Select
            size="small"
            value={blockId}
            options={blockOptions}
            className="room-allotment-step2-select"
            onChange={(v) => {
              setBlockId(v);
              setFloorNumber(ALL);
            }}
          />
          <span className="room-allotment-step2-filter-label">Floor</span>
          <Select
            size="small"
            value={floorNumber}
            options={floorOptions}
            className="room-allotment-step2-select"
            onChange={(v) => {
              setFloorNumber(v);
            }}
          />
          <span className="room-allotment-step2-filter-label">Room Types</span>
          <Select
            size="small"
            value={roomTypeFilter}
            options={[
              { value: ALL, label: "All" },
              { value: "1", label: "Bed 1" },
              { value: "2", label: "Bed 2" },
              { value: "3", label: "Bed 3" }
            ]}
            className="room-allotment-step2-select"
            onChange={(v) => setRoomTypeFilter(v)}
          />
        </Space>
      </div>

      <div className="room-allotment-step2-search">
        <Input
          size="small"
          placeholder="Room No"
          value={roomSearchInput}
          onChange={(e) => setRoomSearchInput(e.target.value)}
          className="room-allotment-step2-room-input"
        />
        <Button
          type="primary"
          size="small"
          icon={<SearchOutlined />}
          className="room-allotment-step2-search-btn"
          onClick={() => setRoomSearch(roomSearchInput.trim())}
        />
        <Button
          type="primary"
          size="small"
          icon={<ReloadOutlined />}
          className="room-allotment-step2-search-btn"
          onClick={() => {
            setRoomSearchInput("");
            setRoomSearch("");
          }}
        />
      </div>

      <Spin spinning={gridLoading}>
        <div className="room-allotment-step2-grid-wrap">
          {filteredSections.map((sec) => (
            <div key={sec.key} className="room-allotment-step2-section">
              <div className="room-allotment-step2-section-head">
                <span className="room-allotment-step2-pill">{sec.hBadge}</span>
                <span className="room-allotment-step2-pill">{sec.bBadge}</span>
                <span className="room-allotment-step2-floor-title">{sec.floorTitle}</span>
                <span className="room-allotment-step2-type-line">
                  <HomeOutlined className="room-allotment-step2-bed-ico" /> {sec.roomTypeLabel}
                </span>
              </div>
              <div className="room-allotment-step2-grid">
                {sec.rooms.map((room) => {
                  const isOcc = room.status === "OCCUPIED";
                  const isSel = roomIdStored === room.roomId;
                  const isAvail = room.status === "AVAILABLE";
                  let cellClass = "room-allotment-cell room-allotment-cell-neutral";
                  if (isOcc) {
                    cellClass = "room-allotment-cell room-allotment-cell-occupied";
                  } else if (isSel) {
                    cellClass = "room-allotment-cell room-allotment-cell-selected";
                  } else if (isAvail) {
                    cellClass = "room-allotment-cell room-allotment-cell-available";
                  }
                  return (
                    <button
                      key={`${sec.key}-${room.roomId}`}
                      type="button"
                      className={cellClass}
                      disabled={!isAvail}
                      onClick={() => void openBedModal(room)}
                    >
                      {room.roomNumber ?? "—"}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Spin>

      <div className="room-allotment-wizard-next-wrap room-allotment-step2-next">
        <Button type="primary" className="room-allotment-wizard-next-btn" onClick={onNext}>
          Next
        </Button>
      </div>

      <Modal
        title="Select Bed"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setModalRoom(null);
        }}
        footer={null}
        destroyOnClose
        width={420}
      >
        <Spin spinning={modalLoading}>
          {modalRoom ? (
            <div className="room-allotment-bed-modal">
              <div className="room-allotment-bed-modal-head">
                <span className="room-allotment-bed-room-pill">
                  <BookOutlined className="room-allotment-bed-room-pill-icon" />
                  Room No. {modalRoom.roomNumber ?? modalRoom.roomId}
                </span>
                <span className="room-allotment-bed-type-label">{formatRoomTypeLabel(modalRoom.type)}</span>
              </div>
              <div className="room-allotment-bed-row">
                {bedOptions.map((bed) => {
                  const vacant = bed.status === "VACANT";
                  const occupied = bed.status === "OCCUPIED";
                  const isSelected = selectedBedId === bed.bedId;
                  let cls = "room-allotment-bed-pill";
                  if (occupied) {
                    cls += " room-allotment-bed-pill-occupied";
                  } else if (vacant && isSelected) {
                    cls += " room-allotment-bed-pill-selected";
                  } else if (vacant) {
                    cls += " room-allotment-bed-pill-vacant";
                  }
                  return (
                    <button
                      key={bed.bedId}
                      type="button"
                      className={cls}
                      disabled={occupied}
                      onClick={() => {
                        if (vacant) {
                          setSelectedBedId(bed.bedId);
                        }
                      }}
                    >
                      <HomeOutlined className="room-allotment-bed-pill-ico" />
                      {bed.bedName ?? bed.bedId}
                    </button>
                  );
                })}
              </div>
              <div className="room-allotment-bed-modal-actions">
                <Button type="primary" loading={selectLoading} onClick={() => void confirmBed()}>
                  Select
                </Button>
              </div>
            </div>
          ) : null}
        </Spin>
      </Modal>
    </div>
  );
};

export default RoomAllotmentStep2SelectRoomPage;
