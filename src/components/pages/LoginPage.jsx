import React, { useState } from "react";
import taLogo from "../../assets/TA.png";
import { useAuth } from "../../context/AuthContext.jsx";
import AuthLayout from "../templates/AuthLayout.jsx";
import Input from "../atoms/Input.jsx";
import Button from "../atoms/Button.jsx";
import { IconLock, IconUser, IconAlertTriangle } from "../atoms/Icons.jsx";

/**
 * Page: LoginPage
 */
export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@semanticflood.org");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(email, password);
    } catch (err) {
      setError(
        err.message || "Authentication failed. Please verify credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Header */}
      <div
        style={{
          padding: "24px 24px 20px",
          borderBottom: "1px solid #f1f5f9",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <img
            src={taLogo}
            alt="SFi Admin Logo"
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              objectFit: "contain",
              flexShrink: 0,
            }}
          />
          <div>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.01em",
              }}
            >
              Admin Operations
            </h2>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              Human-in-the-Loop Curation Tool
            </div>
          </div>
        </div>
        <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.4 }}>
          Sign in with your authorized operator credentials to review and
          publish staged flood disaster records.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 12px",
              borderRadius: 4,
              backgroundColor: "#fff1f2",
              border: "1px solid #fecdd3",
              color: "#9f1239",
              fontSize: 12,
              marginBottom: 16,
            }}
          >
            <IconAlertTriangle size={15} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: "#334155",
              marginBottom: 6,
            }}
          >
            Email Address
          </label>
          <div style={{ position: "relative" }}>
            <Input
              type="email"
              style={{ height: "36px", paddingLeft: "32px", fontSize: "13px" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@semanticflood.org"
              required
            />
            <div
              style={{
                position: "absolute",
                left: 10,
                top: 10,
                color: "#94a3b8",
              }}
            >
              <IconUser size={15} />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: "#334155",
              marginBottom: 6,
            }}
          >
            Password
          </label>
          <div style={{ position: "relative" }}>
            <Input
              type="password"
              style={{ height: "36px", paddingLeft: "32px", fontSize: "13px" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <div
              style={{
                position: "absolute",
                left: 10,
                top: 10,
                color: "#94a3b8",
              }}
            >
              <IconLock size={15} />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          style={{
            width: "100%",
            height: "36px",
            fontSize: "13px",
            fontWeight: 600,
          }}
          disabled={loading}
        >
          {loading ? "Authenticating..." : "Sign In to Dashboard"}
        </Button>

        {/* <div
          style={{
            marginTop: 16,
            padding: '10px 12px',
            borderRadius: 4,
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontSize: 11,
            color: '#64748b',
            lineHeight: 1.4,
          }}
        >
          <strong>Default Superadmin:</strong> <br />
          <code>admin@semanticflood.org</code> / <code>admin123</code>
        </div> */}
      </form>
    </AuthLayout>
  );
}
