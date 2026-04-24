import { useEffect, useMemo } from "react";
import { Button, message } from "antd";
import TreeNode, { TreeLevel, TreeNodeModel } from "../components/TreeNode";
import { useHostelStore } from "../store/hostelStore";
import "./hostel-admin-tree-page.css";

const deriveTree = (hostels: ReturnType<typeof useHostelStore.getState>["hostels"]): TreeNodeModel[] =>
  hostels.map((hostel) => ({
    id: hostel.id,
    label: hostel.name,
    hostelId: hostel.id,
    children: hostel.bhavanAs.map((bhavana) => ({
      id: bhavana.bhavanaId,
      label: bhavana.name,
      hostelId: hostel.id,
      bhavanaId: bhavana.bhavanaId,
      children: bhavana.blocks.map((block) => ({
        id: block.blockId,
        label: block.blockId,
        hostelId: hostel.id,
        bhavanaId: bhavana.bhavanaId,
        blockId: block.blockId,
        children: block.floors.map((floor) => ({
          id: floor.floorId,
          label: floor.floorNumber,
          hostelId: hostel.id,
          bhavanaId: bhavana.bhavanaId,
          blockId: block.blockId,
          floorId: floor.floorId,
          children: floor.rooms.map((room) => ({
            id: room.roomId,
            label: room.roomNumber ?? room.roomId,
            hostelId: hostel.id,
            bhavanaId: bhavana.bhavanaId,
            blockId: block.blockId,
            floorId: floor.floorId,
            roomId: room.roomId,
            children: room.beds.map((bed) => ({
              id: bed.bedId,
              label: bed.bedName ?? bed.bedId,
              bedName: bed.bedName,
              hostelId: hostel.id,
              bhavanaId: bhavana.bhavanaId,
              blockId: block.blockId,
              floorId: floor.floorId,
              roomId: room.roomId
            }))
          }))
        }))
      }))
    }))
  }));

const HostelAdminTreePage = () => {
  const { hostels, loading, fetchHostels, addNode, deleteNode, renameNode } = useHostelStore();

  useEffect(() => {
    void fetchHostels();
  }, [fetchHostels]);

  const treeRows = useMemo(() => deriveTree(hostels), [hostels]);

  const handleAdd = async (
    node: TreeNodeModel,
    level: TreeLevel,
    payload: string | { roomNumber: string; roomType: number }
  ) => {
    try {
      if (level === "hostel") {
        await addNode("bhavana", { hostelId: node.hostelId }, String(payload));
      } else if (level === "bhavana") {
        await addNode(
          "block",
          { hostelId: node.hostelId, bhavanaId: node.bhavanaId },
          String(payload)
        );
      } else if (level === "block") {
        await addNode(
          "floor",
          { hostelId: node.hostelId, bhavanaId: node.bhavanaId, blockId: node.blockId },
          String(payload)
        );
      } else if (level === "floor") {
        await addNode(
          "room",
          {
            hostelId: node.hostelId,
            bhavanaId: node.bhavanaId,
            blockId: node.blockId,
            floorId: node.floorId
          },
          payload as { roomNumber: string; roomType: number }
        );
      } else if (level === "room") {
        await addNode(
          "bed",
          {
            hostelId: node.hostelId,
            bhavanaId: node.bhavanaId,
            blockId: node.blockId,
            floorId: node.floorId,
            roomId: node.roomId
          },
          String(payload)
        );
      }
      message.success("Updated");
    } catch (error) {
      message.error("Unable to add node");
    }
  };

  const handleEdit = () => {};

  const handleDelete = async (node: TreeNodeModel, level: TreeLevel) => {
    try {
      await deleteNode(node.hostelId, level, node.id);
      message.success("Deleted");
    } catch (error) {
      message.error("Unable to delete node");
    }
  };

  const handleRename = async (node: TreeNodeModel, level: TreeLevel, value: string) => {
    try {
      await renameNode(node.hostelId, level, node.id, value);
      message.success("Updated");
    } catch (error) {
      message.error("Unable to rename node");
    }
  };

  return (
    <div className="hostel-admin-page">
      <div className="hostel-admin-card">
        <div className="hostel-admin-header">Add Hostel Data</div>
        <div className="hostel-admin-tree-wrap">
          {treeRows.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              level="hostel"
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRename={handleRename}
            />
          ))}
          {loading && <div className="hostel-admin-loading">Loading...</div>}
        </div>
        <div className="hostel-admin-footer">
          <Button type="primary" size="small" className="hostel-admin-submit">
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HostelAdminTreePage;
