import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000/api/members";
const UPLOADS = "http://localhost:5000/uploads";

function MemberDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(undefined); // undefined = loading
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchMember();
  }, [id]);

  const fetchMember = async () => {
    try {
      const res = await axios.get(`${API}/${id}`);
      setMember(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load member");
      setMember(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${API}/${id}`);
      navigate("/members");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Delete failed");
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  // Loading
  if (member === undefined) {
    return (
      <div className="page-container" style={{ maxWidth: "720px" }}>
        <div className="back-link">← Back to members</div>
        <div className="card">
          <div className="detail-banner" />
          <div className="detail-content">
            <div className="skeleton" style={{ width: "120px", height: "120px", borderRadius: "50%", marginBottom: "20px" }} />
            <div className="skeleton skeleton-line" style={{ width: "200px", height: "24px", marginBottom: "12px" }} />
            <div className="skeleton skeleton-line" style={{ width: "140px", height: "16px" }} />
          </div>
        </div>
      </div>
    );
  }

  // Not found
  if (member === null) {
    return (
      <div className="page-container" style={{ maxWidth: "720px" }}>
        <Link to="/members" className="back-link">← Back to members</Link>
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>Member not found</h3>
          <p>{error || "This member may have been removed."}</p>
          <Link to="/members" className="btn btn-primary">
            Browse Members
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = member.image ? `${UPLOADS}/${member.image}` : null;
  const initials = member.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="page-container" style={{ maxWidth: "720px" }}>
      <Link to="/members" className="back-link">← Back to members</Link>

      <div className="card" style={{ overflow: "hidden" }}>
        {/* Gradient banner */}
        <div className="detail-banner" />

        <div className="detail-content">
          {/* Avatar + name */}
          <div className="detail-header">
            {imageUrl ? (
              <img src={imageUrl} alt={member.name} className="detail-avatar" />
            ) : (
              <div className="detail-avatar-fallback">{initials}</div>
            )}
            <div>
              <h1 className="detail-name">{member.name}</h1>
              <span className="detail-badge">{member.role}</span>
            </div>
          </div>

          {/* Detail fields */}
          <div className="detail-fields">
            <div className="detail-field">
              <span className="detail-field-icon">✉️</span>
              <div>
                <div className="detail-field-label">Email</div>
                <div className="detail-field-value">
                  <a href={`mailto:${member.email}`}>{member.email}</a>
                </div>
              </div>
            </div>

            <div className="detail-field">
              <span className="detail-field-icon">💼</span>
              <div>
                <div className="detail-field-label">Role</div>
                <div className="detail-field-value">{member.role}</div>
              </div>
            </div>

            <div className="detail-field">
              <span className="detail-field-icon">📅</span>
              <div>
                <div className="detail-field-label">Added</div>
                <div className="detail-field-value">
                  {new Date(member.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Edit & Delete buttons */}
          <div className="detail-actions">
            <Link to={`/members/${member._id}/edit`} className="btn btn-outline">
              ✏️ Edit Member
            </Link>
            <button
              className="btn btn-danger"
              onClick={() => setShowConfirm(true)}
            >
              🗑️ Delete Member
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => !deleting && setShowConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Remove {member.name}?</h3>
            <p className="modal-desc">
              This will permanently delete the member and their profile image. This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberDetails;

