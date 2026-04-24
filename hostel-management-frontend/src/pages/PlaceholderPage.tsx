import { Card, Typography } from "antd";

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage = ({ title }: PlaceholderPageProps) => {
  return (
    <Card bordered={false}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        {title}
      </Typography.Title>
    </Card>
  );
};

export default PlaceholderPage;
