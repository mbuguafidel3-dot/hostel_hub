import { Building2, MapPin } from "lucide-react";
import "../styles/current-placement.css";

const CurrentPlacementPanel = ({
  placement,
  mode = "default",
  actionButton = null,
  showNoticeChip = true,
  noticeMessage = "",
  className = "",
}) => {
  if (!placement) return null;

  return (
    <section
      className={`placement-panel placement-panel-${mode} ${className}`.trim()}
    >
      <div className="placement-panel-main">
        <h3>{placement.hostel_name}</h3>

        <div className="placement-panel-meta">
          <span>
            <MapPin size={16} />
            {placement.location}
          </span>
          <span>
            <Building2 size={16} />
            Unit {placement.unit_number}
          </span>
        </div>

        {showNoticeChip && placement.notice_given === 1 && (
          <span className="placement-panel-notice-chip">
            Notice Given on{" "}
            {new Date(placement.notice_date).toLocaleDateString()}
          </span>
        )}
      </div>

      {actionButton && (
        <button
          className={`auth-button placement-panel-action ${actionButton.variant === "danger" ? "placement-panel-action-danger" : ""}`.trim()}
          onClick={actionButton.onClick}
        >
          {actionButton.label}
        </button>
      )}

      {noticeMessage && <p className="placement-panel-note">{noticeMessage}</p>}
    </section>
  );
};

export default CurrentPlacementPanel;
