import { useMemo, useState } from "react";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  PlusOutlined,
  RightOutlined
} from "@ant-design/icons";
import { Button, Input, Modal, Select } from "antd";
import "./tree-node.css";

export type TreeLevel = "hostel" | "bhavana" | "block" | "floor" | "room" | "bed";

export interface TreeNodeModel {
  id: string;
  label: string;
  bedName?: string;
  hostelId: string;
  bhavanaId?: string;
  blockId?: string;
  floorId?: string;
  roomId?: string;
  children?: TreeNodeModel[];
}

interface TreeNodeProps {
  node: TreeNodeModel;
  level: TreeLevel;
  onAdd: (
    node: TreeNodeModel,
    level: TreeLevel,
    payload: string | { roomNumber: string; roomType: number }
  ) => Promise<void>;
  onEdit: (node: TreeNodeModel, level: TreeLevel) => void;
  onDelete: (node: TreeNodeModel, level: TreeLevel) => Promise<void>;
  onRename: (node: TreeNodeModel, level: TreeLevel, value: string) => Promise<void>;
}

const NEXT_LEVEL: Record<Exclude<TreeLevel, "bed">, TreeLevel> = {
  hostel: "bhavana",
  bhavana: "block",
  block: "floor",
  floor: "room",
  room: "bed"
};

const ADD_PLACEHOLDER: Record<Exclude<TreeLevel, "bed">, string> = {
  hostel: "Add Bhavana",
  bhavana: "Add Block",
  block: "Add Floor",
  floor: "Add Room",
  room: "Add Bed"
};

const ROOM_TYPE_OPTIONS = [
  { value: 1, label: "1 Bedded" },
  { value: 2, label: "2 Bedded" },
  { value: 3, label: "3 Bedded" }
];

const TreeNode = ({ node, level, onAdd, onEdit, onDelete, onRename }: TreeNodeProps) => {
  const [expanded, setExpanded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomNumber, setRoomNumber] = useState("");
  const [roomType, setRoomType] = useState<number>(2);

  const hasChildren = (node.children?.length ?? 0) > 0;
  const canExpand = hasChildren || level !== "bed";
  const nextLevel = level === "bed" ? null : NEXT_LEVEL[level];
  const showOnlyPlus = level === "hostel";

  const rowIndent = useMemo(() => {
    const order: TreeLevel[] = ["hostel", "bhavana", "block", "floor", "room", "bed"];
    return order.indexOf(level) * 18;
  }, [level]);

  const toggle = () => {
    if (!canExpand) return;
    setExpanded((prev) => !prev);
  };

  const resetInlineState = () => {
    setAdding(false);
    setEditing(false);
    setInputValue("");
    setAddLoading(false);
  };

  const handleInlineAdd = async () => {
    if (!nextLevel || !inputValue.trim()) {
      return;
    }
    setAddLoading(true);
    try {
      await onAdd(node, level, inputValue.trim());
      resetInlineState();
      setExpanded(true);
    } finally {
      setAddLoading(false);
    }
  };

  const handleRename = async () => {
    if (!inputValue.trim()) return;
    setAddLoading(true);
    try {
      await onRename(node, level, inputValue.trim());
      resetInlineState();
    } finally {
      setAddLoading(false);
    }
  };

  const handleRoomAdd = async () => {
    if (!roomNumber.trim()) return;
    setAddLoading(true);
    try {
      await onAdd(node, level, { roomNumber: roomNumber.trim(), roomType: roomType });
      setRoomModalOpen(false);
      setRoomNumber("");
      setRoomType(2);
      setExpanded(true);
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="tree-node-wrap">
      <div className="tree-node-row" style={{ paddingLeft: 8 + rowIndent }}>
        <div className="tree-node-label" onClick={toggle}>
          {canExpand ? expanded ? <DownOutlined /> : <RightOutlined /> : <span className="tree-node-dot" />}
          <span>{level === "bed" ? node.bedName ?? node.label : node.label}</span>
        </div>
        <div className="tree-node-actions">
          {level !== "bed" && (
            <button
              type="button"
              className="tree-icon-btn add"
              onClick={() => {
                if (level === "floor") {
                  setRoomModalOpen(true);
                } else {
                  setAdding(true);
                  setEditing(false);
                  setInputValue("");
                  setExpanded(true);
                }
              }}
            >
              <PlusOutlined />
            </button>
          )}
          {!showOnlyPlus && (
            <button
              type="button"
              className="tree-icon-btn edit"
              onClick={() => {
                onEdit(node, level);
                setEditing(true);
                setAdding(false);
                setInputValue(node.label);
              }}
            >
              <EditOutlined />
            </button>
          )}
          {!showOnlyPlus && (
            <button
              type="button"
              className="tree-icon-btn delete"
              onClick={() => {
                void onDelete(node, level);
              }}
            >
              <DeleteOutlined />
            </button>
          )}
        </div>
      </div>

      {adding && nextLevel && (
        <div className="tree-node-inline" style={{ paddingLeft: 30 + rowIndent }}>
          <Input
            size="small"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder={ADD_PLACEHOLDER[level as Exclude<TreeLevel, "bed">]}
            className="tree-inline-input"
          />
          <button
            type="button"
            className="tree-icon-btn add"
            onClick={() => {
              void handleInlineAdd();
            }}
            disabled={addLoading}
          >
            <CheckOutlined />
          </button>
          <button type="button" className="tree-icon-btn delete" onClick={resetInlineState}>
            <CloseOutlined />
          </button>
        </div>
      )}

      {editing && (
        <div className="tree-node-inline" style={{ paddingLeft: 30 + rowIndent }}>
          <Input
            size="small"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            className="tree-inline-input"
          />
          <button
            type="button"
            className="tree-icon-btn edit"
            onClick={() => {
              void handleRename();
            }}
            disabled={addLoading}
          >
            <CheckOutlined />
          </button>
          <button type="button" className="tree-icon-btn delete" onClick={resetInlineState}>
            <CloseOutlined />
          </button>
        </div>
      )}

      {expanded &&
        node.children?.map((child) => (
          <TreeNode
            key={`${level}-${child.id}`}
            node={child}
            level={nextLevel as TreeLevel}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
            onRename={onRename}
          />
        ))}

      <Modal
        title="Add Room"
        open={roomModalOpen}
        onCancel={() => setRoomModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setRoomModalOpen(false)}>
            Cancel
          </Button>,
          <Button key="ok" type="primary" loading={addLoading} onClick={() => void handleRoomAdd()}>
            Add
          </Button>
        ]}
      >
        <Input
          value={roomNumber}
          onChange={(event) => setRoomNumber(event.target.value)}
          placeholder="Room Number"
          style={{ marginBottom: 10 }}
        />
        <Select
          value={roomType}
          onChange={(value) => setRoomType(value)}
          options={ROOM_TYPE_OPTIONS}
          style={{ width: "100%" }}
        />
      </Modal>
    </div>
  );
};

export default TreeNode;
