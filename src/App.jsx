import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";
import { supabase } from "./supabaseClient.js";

// Helper components
function ErrorMessage({ children }) {
  return (
    <div className="error-message">
      <span className="error-icon">⚠️</span>
      {children}
    </div>
  );
}

function Loader() {
  return (
    <div className="loader-container">
      <div className="loader"></div>
      <p>Loading...</p>
    </div>
  );
}

// Home page
function Home() {
  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Build Your <span className="gradient-text">Dream Team</span>
          </h1>
          <p className="hero-description">
            Organize, track, and manage your team members with ease. Perfect for
            projects, games, or any collaborative work.
          </p>
          <div className="hero-buttons">
            <Link to="/crew/new" className="btn btn-primary">
              <span>✨</span> Create New Member
            </Link>
            <Link to="/crew" className="btn btn-outline">
              <span>👥</span> View Gallery
            </Link>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <div className="stat-number">100+</div>
            <div className="stat-label">Team Members</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">20+</div>
            <div className="stat-label">Skills</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">5</div>
            <div className="stat-label">Categories</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Gallery with filters
function CrewGallery() {
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  async function fetchCrew() {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("crewmates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCrew(data || []);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCrew();

    const channel = supabase
      .channel("realtime-crewmates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "crewmates" },
        fetchCrew
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const filteredCrew = crew.filter((member) => {
    const matchesSearch = member.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "All" || member.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="gallery-page">
      <div className="gallery-header">
        <div>
          <h1 className="page-title">Team Gallery</h1>
          <p className="page-subtitle">
            {crew.length} team member{crew.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link to="/crew/new" className="btn btn-primary">
          <span>+</span> Add Member
        </Link>
      </div>

      <div className="gallery-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-chips">
          {["All", "Dev", "Space", "Pirate", "Default"].map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${
                filterCategory === cat ? "active" : ""
              }`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {loading ? (
        <Loader />
      ) : filteredCrew.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No team members found</h3>
          <p>
            {searchTerm || filterCategory !== "All"
              ? "Try adjusting your filters"
              : "Get started by adding your first team member"}
          </p>
          {!searchTerm && filterCategory === "All" && (
            <Link to="/crew/new" className="btn btn-primary">
              Add First Member
            </Link>
          )}
        </div>
      ) : (
        <div className="crew-grid">
          {filteredCrew.map((member) => (
            <Link
              to={`/crew/${member.id}`}
              key={member.id}
              className="member-card"
            >
              <div className="member-header">
                <div className="member-avatar">
                  {(member.name || "?")[0].toUpperCase()}
                </div>
                <div className="member-badge">{member.category || "N/A"}</div>
              </div>
              <div className="member-body">
                <h3 className="member-name">{member.name}</h3>
                <p className="member-role">
                  {member.attributes?.role || "No role assigned"}
                </p>
                {member.attributes?.skills &&
                  member.attributes.skills.length > 0 && (
                    <div className="member-skills">
                      {member.attributes.skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                      {member.attributes.skills.length > 3 && (
                        <span className="skill-tag more">
                          +{member.attributes.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                <div className="member-level">
                  {member.attributes?.level || "Unranked"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Detail page
function CrewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    supabase
      .from("crewmates")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setError(error.message || String(error));
        } else {
          setMember(data);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (!member) {
    return (
      <div className="empty-state">
        <div className="empty-icon">❌</div>
        <h3>Member not found</h3>
        <Link to="/crew" className="btn btn-outline">
          Back to Gallery
        </Link>
      </div>
    );
  }

  const attrs = member.attributes || {};

  return (
    <div className="detail-page">
      <div className="detail-header">
        <button onClick={() => navigate("/crew")} className="back-button">
          ← Back
        </button>
        <div className="detail-actions">
          <Link to={`/crew/${id}/edit`} className="btn btn-primary">
            ✏️ Edit
          </Link>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-hero">
          <div className="detail-avatar">
            {(member.name || "?")[0].toUpperCase()}
          </div>
          <div className="detail-info">
            <h1 className="detail-name">{member.name}</h1>
            <div className="detail-category-badge">
              {member.category || "Uncategorized"}
            </div>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-card">
            <div className="detail-card-header">
              <span className="card-icon">👤</span>
              <h3>Role</h3>
            </div>
            <p className="detail-value">{attrs.role || "Not assigned"}</p>
          </div>

          <div className="detail-card">
            <div className="detail-card-header">
              <span className="card-icon">⭐</span>
              <h3>Level</h3>
            </div>
            <p className="detail-value">{attrs.level || "Unranked"}</p>
          </div>

          <div className="detail-card full-width">
            <div className="detail-card-header">
              <span className="card-icon">🎯</span>
              <h3>Skills</h3>
            </div>
            {attrs.skills && attrs.skills.length > 0 ? (
              <div className="skills-grid">
                {attrs.skills.map((skill, i) => (
                  <span key={i} className="skill-badge">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="detail-value">No skills added</p>
            )}
          </div>

          {attrs.notes && (
            <div className="detail-card full-width">
              <div className="detail-card-header">
                <span className="card-icon">📝</span>
                <h3>Notes</h3>
              </div>
              <p className="detail-notes">{attrs.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Categories
const categories = {
  Dev: {
    skills: [
      "React",
      "Node.js",
      "Python",
      "Go",
      "Vue",
      "Angular",
      "TypeScript",
      "Django",
      "Flask",
      "Express",
      "GraphQL",
      "SQL",
      "MongoDB",
      "Docker",
      "Kubernetes",
      "AWS",
      "Firebase",
      "Next.js",
      "Tailwind CSS",
      "Redux",
    ],
    levels: ["Intern", "Junior", "Mid-level", "Senior", "Lead"],
  },
  Space: {
    skills: ["Piloting", "Astrogation", "Engineering", "Combat", "Repair"],
    levels: ["Cadet", "Pilot", "Officer", "Commander"],
  },
  Pirate: {
    skills: ["Swordsmanship", "Navigation", "Intimidation", "Treasure Hunting"],
    levels: ["Deckhand", "Buccaneer", "First Mate", "Captain"],
  },
  Default: {
    skills: ["Communication", "Leadership", "Problem Solving", "Teamwork"],
    levels: ["Novice", "Intermediate", "Adept", "Expert"],
  },
};

// Form with multi-select skills
function CrewForm({ mode = "create" }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Dev");
  const [attributes, setAttributes] = useState({
    role: "",
    skills: [],
    level: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mode === "edit" && id) {
      setLoading(true);
      setError(null);

      supabase
        .from("crewmates")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            setError(error.message || String(error));
          } else if (data) {
            setName(data.name);
            setCategory(data.category || "Dev");
            setAttributes(
              data.attributes || {
                role: "",
                skills: [],
                level: "",
                notes: "",
              }
            );
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, mode]);

  useEffect(() => {
    const cat = categories[category] || categories["Default"];
    setAttributes((prev) => ({
      ...prev,
      skills: prev.skills || [],
      level: prev.level || cat.levels[0],
    }));
  }, [category]);

  function toggleSkill(skill) {
    setAttributes((prev) => {
      const currentSkills = prev.skills || [];
      if (currentSkills.includes(skill)) {
        return { ...prev, skills: currentSkills.filter((s) => s !== skill) };
      } else {
        return { ...prev, skills: [...currentSkills, skill] };
      }
    });
  }

  function setAttr(key, value) {
    setAttributes((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter a name");
      return;
    }

    if (!attributes.role) {
      alert("Please select a role");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      name: name.trim(),
      category,
      attributes,
      updated_at: new Date(),
    };

    try {
      if (mode === "create") {
        const { error } = await supabase.from("crewmates").insert([payload]);
        if (error) throw error;
        navigate("/crew");
      } else {
        const { error } = await supabase
          .from("crewmates")
          .update(payload)
          .eq("id", id);
        if (error) throw error;
        navigate(`/crew/${id}`);
      }
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this team member?")) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.from("crewmates").delete().eq("id", id);
      if (error) throw error;
      navigate("/crew");
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  const cat = categories[category] || categories["Default"];

  return (
    <div className="form-page">
      <div className="form-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <h1 className="page-title">
          {mode === "create" ? "Create Team Member" : "Edit Team Member"}
        </h1>
      </div>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <form className="member-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2 className="section-title">Basic Information</h2>

          <div className="form-group">
            <label className="form-label">
              Name <span className="required">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="Enter member name"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Category <span className="required">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-select"
              disabled={loading}
            >
              {Object.keys(categories).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">
            Role <span className="required">*</span>
          </h2>
          <div className="role-grid">
            {["Leader", "Engineer", "Pilot", "Medic", "Scout"].map((role) => (
              <button
                type="button"
                key={role}
                className={`role-card ${
                  attributes.role === role ? "selected" : ""
                }`}
                onClick={() => setAttr("role", role)}
                disabled={loading}
              >
                <span className="role-icon">
                  {role === "Leader" && "👑"}
                  {role === "Engineer" && "🔧"}
                  {role === "Pilot" && "✈️"}
                  {role === "Medic" && "⚕️"}
                  {role === "Scout" && "🔭"}
                </span>
                <span className="role-name">{role}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">Skills (Select Multiple)</h2>
          <div className="skills-select">
            {cat.skills.map((skill) => (
              <button
                type="button"
                key={skill}
                className={`skill-chip ${
                  attributes.skills?.includes(skill) ? "selected" : ""
                }`}
                onClick={() => toggleSkill(skill)}
                disabled={loading}
              >
                {skill}
                {attributes.skills?.includes(skill) && (
                  <span className="check-icon">✓</span>
                )}
              </button>
            ))}
          </div>
          {attributes.skills?.length > 0 && (
            <p className="skills-count">
              {attributes.skills.length} skill
              {attributes.skills.length !== 1 ? "s" : ""} selected
            </p>
          )}
        </div>

        <div className="form-section">
          <h2 className="section-title">Level</h2>
          <div className="level-select">
            {cat.levels.map((level) => (
              <button
                type="button"
                key={level}
                className={`level-option ${
                  attributes.level === level ? "selected" : ""
                }`}
                onClick={() => setAttr("level", level)}
                disabled={loading}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">Additional Notes</h2>
          <div className="form-group">
            <textarea
              value={attributes.notes || ""}
              onChange={(e) => setAttr("notes", e.target.value)}
              className="form-textarea"
              placeholder="Add any additional information..."
              rows="4"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : mode === "create"
              ? "Create Member"
              : "Save Changes"}
          </button>
          <button
            type="button"
            className="btn btn-outline btn-large"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </button>
          {mode === "edit" && (
            <button
              type="button"
              className="btn btn-danger btn-large"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete Member
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// Main App
export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">⚡</span>
            TeamForge
          </Link>
          <div className="navbar-links">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/crew" className="nav-link">
              Gallery
            </Link>
            <Link to="/crew/new" className="btn btn-primary btn-sm">
              + New
            </Link>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/crew" element={<CrewGallery />} />
            <Route path="/crew/new" element={<CrewForm mode="create" />} />
            <Route path="/crew/:id" element={<CrewDetail />} />
            <Route path="/crew/:id/edit" element={<CrewForm mode="edit" />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>TeamForge © 2025 • Built with ❤️</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
