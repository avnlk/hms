import { CalendarOutlined } from "@ant-design/icons";
import { Button, DatePicker, Popover, Space } from "antd";
import type { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import "./date-range-filter.css";

const { RangePicker } = DatePicker;

export type DateRangeValue = [Dayjs, Dayjs];

export type DateRangeFilterProps = {
  value: DateRangeValue | null;
  onChange: (next: DateRangeValue | null) => void;
};

function formatRangeTag(start: Dayjs, end: Dayjs): string {
  return `${start.format("MMM D")} - ${end.format("MMM D")}`;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [draft, setDraft] = useState<DateRangeValue | null>(value);

  useEffect(() => {
    if (popoverOpen) {
      setDraft(value);
    }
  }, [popoverOpen, value]);

  const handleDone = () => {
    if (draft?.[0] && draft?.[1]) {
      onChange(draft);
    }
    setPopoverOpen(false);
  };

  const popoverContent = (
    <div className="date-range-filter-popover-content">
      <div className="date-range-filter-popup-header">
        <Space size="small" className="date-range-filter-range-text-wrap">
          <CalendarOutlined className="date-range-filter-popup-header-icon" />
          <span className="date-range-filter-range-tag">
            {draft?.[0] && draft?.[1] ? formatRangeTag(draft[0], draft[1]) : "Select range"}
          </span>
        </Space>
        <Button type="primary" size="small" className="date-range-filter-done" onClick={handleDone}>
          Done
        </Button>
      </div>
      <RangePicker
        open={popoverOpen}
        value={draft ?? undefined}
        onChange={(dates) => {
          if (dates?.[0] && dates?.[1]) {
            setDraft([dates[0], dates[1]]);
          } else {
            setDraft(null);
          }
        }}
        format="DD/MM/YYYY"
        className="date-range-filter-embedded"
        allowClear={false}
        getPopupContainer={(trigger) =>
          trigger.closest(".ant-popover-inner-content") ?? document.body
        }
      />
    </div>
  );

  return (
    <Popover
      trigger="click"
      open={popoverOpen}
      onOpenChange={setPopoverOpen}
      placement="bottomLeft"
      overlayClassName="date-range-filter-popover"
      content={popoverContent}
    >
      <Button type="default" className="date-range-filter-trigger" icon={<CalendarOutlined />}>
        Duration
      </Button>
    </Popover>
  );
}
