import React, { useEffect, useState } from "react";
import "./styles/Processing.css";

type ProcessingProps = {
  data: {
    message: string;
    current: number;
    total: number;
    completed?: boolean;
  };
};

const Processing = ({ data }: ProcessingProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Cập nhật tiến trình khi data thay đổi
    if (data.total > 0) {
      setProgress(Math.floor((data.current / data.total) * 100));
    }
  }, [data.current, data.total]);



  // Nếu đã hoàn thành, hiển thị thông báo hoàn thành
  if (data.completed) {
    return (
      <div className="processing-container completed">
        <div className="processing-content">
          <h2>Styles updated successfully</h2>
          <div className="progress-info">
            <span>{data.current} / {data.total} styles</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="processing-message success">
            <span>{data.message}</span>
          </div>

        </div>
      </div>
    );
  }

  // Hiển thị trạng thái đang xử lý
  return (
    <div className="processing-container">
      <div className="processing-content">
        <h2>Updating Styles</h2>
        <div className="progress-info">
          <span>{data.current} / {data.total} styles</span>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="processing-message">
          <span>{data.message}</span>
        </div>
      </div>
    </div>
  );
};

export default Processing; 