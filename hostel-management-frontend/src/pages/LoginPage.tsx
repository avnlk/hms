import {
  FacebookFilled,
  GithubFilled,
  LinkedinFilled,
  LockOutlined,
  MailOutlined,
  TwitterOutlined,
  YoutubeFilled
} from "@ant-design/icons";
import { useKeycloak } from "@react-keycloak/web";
import { Button, Form, Input, message } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/iiitb-logo.png";
import "./login-page.css";

const LoginPage = () => {
  const { keycloak, initialized } = useKeycloak();
  const navigate = useNavigate();
  const [form] = Form.useForm<{ email: string; password: string }>();

  useEffect(() => {
    if (initialized && keycloak.authenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [initialized, keycloak.authenticated, navigate]);

  const handleLogin = () => {
    const email = (form.getFieldValue("email") as string | undefined)?.trim() ?? "";
    void keycloak
      .login(email ? { loginHint: email } : undefined)
      .catch(() => message.error("Unable to start login. Please try again."));
  };

  return (
    <div className="login-page">
      <header className="login-top-bar">Login</header>
      <div className="login-split">
        <aside className="login-brand" aria-hidden={false}>
          <div className="login-brand-waves" aria-hidden>
            <div className="login-brand-wave login-brand-wave-1" />
            <div className="login-brand-wave login-brand-wave-2" />
            <svg
              className="login-brand-wave-svg"
              viewBox="0 0 1440 200"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="rgba(255,255,255,0.09)"
                d="M0,120 C240,40 480,200 720,100 C960,0 1200,160 1440,80 L1440,200 L0,200 Z"
              />
              <path
                fill="rgba(255,255,255,0.05)"
                d="M0,160 C320,80 560,200 800,120 C1040,40 1280,180 1440,140 L1440,200 L0,200 Z"
              />
            </svg>
          </div>
          <div className="login-brand-inner">
            <img src={logo} alt="IIIT Bangalore" className="login-brand-logo" />
            <p className="login-brand-institute">
              International Institute of Information Technology Bangalore
            </p>
            <h1 className="login-brand-title">HOSTEL MANAGEMENT SYSTEM</h1>
          </div>
          <footer className="login-brand-footer">
            <div className="login-brand-social">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <GithubFilled />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FacebookFilled />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <TwitterOutlined />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <LinkedinFilled />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <YoutubeFilled />
              </a>
            </div>
            <p className="login-brand-copy">
              © 2024 Copyright: International Institute of Information Technology - Bangalore
            </p>
            <p className="login-brand-support">Technical Support - application@iiitb.ac.in</p>
          </footer>
        </aside>

        <section className="login-form-panel">
          <div className="login-form-inner">
            <h2 className="login-form-heading">Login Form</h2>
            <Form form={form} layout="vertical" requiredMark={false} onFinish={() => void handleLogin()}>
              <Form.Item name="email" style={{ marginBottom: 16 }}>
                <Input
                  className="login-form-input"
                  size="large"
                  placeholder="Email Address"
                  prefix={<MailOutlined />}
                  autoComplete="username"
                />
              </Form.Item>
              <Form.Item name="password" style={{ marginBottom: 20 }}>
                <Input.Password
                  className="login-form-input"
                  size="large"
                  placeholder="Password"
                  prefix={<LockOutlined />}
                  autoComplete="current-password"
                />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" block size="large" className="login-form-submit">
                  Login
                </Button>
              </Form.Item>
            </Form>
            <div className="login-form-links">
              <div className="login-form-links-row">
                <button type="button" className="login-form-link" onClick={() => void handleLogin()}>
                  Forgot Password?
                </button>
              </div>
              <p className="login-form-links-hint">
                To Change Password,{" "}
                <button type="button" className="login-form-link" onClick={() => void handleLogin()}>
                  Click here.
                </button>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
