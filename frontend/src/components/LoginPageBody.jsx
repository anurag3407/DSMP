import React from "react";
import mainImage from "../assets/mainLoginPageImage.png";
import metamaskIcon from "../assets/Metamaskicon.png";
import { connectWallet } from "../utils/web3.js";

const getResponsiveBodyStyles = () => {
  const width = window.innerWidth;
  let bodyStyle = {
    backgroundColor: "#f0f9f8",
    minHeight: "calc(100vh - 80px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    fontFamily: "'Inter', sans-serif"
  };
  let headingStyle = {
    color: "#2C3E50",
    fontWeight: 700,
    fontSize: "clamp(32px, 5vw, 64px)",
    margin: "0 0 40px 0",
    lineHeight: 1.1,
    letterSpacing: "-1px"
  };
  let layoutStyle = {
    display: "flex",
    alignItems: "stretch",
    justifyContent: "space-between",
    gap: 0,
    maxWidth: "1200px",
    margin: "0 auto",
    flexWrap: "wrap"
  };
  let sectionStyle = {
    flex: "0 0 280px",
    background: "#4ECDC4",
    color: "white",
    borderRadius: "20px",
    padding: "60px 30px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    position: "relative",
    minHeight: "400px",
    marginBottom: "30px", // Add spacing between vertical sections
    boxShadow: "0 4px 24px rgba(78,205,196,0.10)"
  };
  let sectionRightStyle = {
    ...sectionStyle,
    background: "#4ECDC4",
    borderRadius: "20px",
    marginBottom: "30px"
  };
  let imageStyle = {
    flex: "1 1 400px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    backgroundColor: "white",
    minHeight: "400px",
    borderRadius: "20px",
    marginBottom: "30px",
    boxShadow: "0 4px 24px rgba(44,62,80,0.08)"
  };
  let imgStyle = {
    width: "100%",
    maxWidth: "500px",
    height: "auto",
    objectFit: "contain"
  };
  let sectionIconStyle = {
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "50%",
    width: 80,
    height: 80,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30
  };
  let sectionTitleStyle = {
    fontSize: 24,
    fontWeight: 600,
    margin: 0,
    lineHeight: 1.3
  };
  let metamaskBtnStyle = {
    marginBottom: 60,
    background: "linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)",
    color: "white",
    fontWeight: 600,
    border: "none",
    padding: "18px 45px",
    borderRadius: 50,
    fontSize: 18,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    boxShadow: "0 8px 25px rgba(139, 92, 246, 0.3)",
    transition: "all 0.3s ease",
    textTransform: "uppercase",
    letterSpacing: "1px"
  };

  // Responsive adjustments
  if (width < 900) {
  layoutStyle.flexDirection = "column";
  layoutStyle.alignItems = "center";   // keep vertical stack centered
  layoutStyle.justifyContent = "center";
  layoutStyle.gap = "0";
  layoutStyle.maxWidth = "100%";

  sectionStyle.minHeight = "250px";
  sectionStyle.padding = "30px 15px";
  sectionRightStyle = { ...sectionStyle, background: "#4ECDC4" };

  sectionIconStyle.width = 60;
  sectionIconStyle.height = 60;
  sectionIconStyle.marginBottom = 15;

  sectionTitleStyle.fontSize = 18;

  imageStyle.borderRadius = "20px";
  imageStyle.minHeight = "250px";
  imageStyle.padding = "30px 15px";
  imageStyle.marginBottom = "30px";
}

  if (width < 600) {
    bodyStyle.padding = "20px 5px";
    headingStyle.fontSize = "28px";
    metamaskBtnStyle.padding = "12px 20px";
    metamaskBtnStyle.fontSize = 14;
    sectionTitleStyle.fontSize = 16;
    sectionStyle.minHeight = "180px";
    imageStyle.minHeight = "180px";
    sectionRightStyle.minHeight = "180px";
  }

  return {
    bodyStyle,
    headingStyle,
    layoutStyle,
    sectionStyle,
    sectionRightStyle,
    sectionIconStyle,
    sectionTitleStyle,
    imageStyle,
    imgStyle,
    metamaskBtnStyle
  };
};

const LoginPageBody = ({ onLogin }) => {
  const {
    bodyStyle,
    headingStyle,
    layoutStyle,
    sectionStyle,
    sectionRightStyle,
    sectionIconStyle,
    sectionTitleStyle,
    imageStyle,
    imgStyle,
    metamaskBtnStyle
  } = getResponsiveBodyStyles();

  return (
    <div style={bodyStyle}>
      <div style={{ width: "100%", maxWidth: "1400px", textAlign: "center", position: "relative" }}>
        <h1 style={headingStyle}>
          Discover a New Era of Social.<br />
          <span style={{ color: "#2C3E50" }}>CONNECT</span>
        </h1>
        <button
          style={metamaskBtnStyle}
          onMouseOver={e => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 12px 35px rgba(139, 92, 246, 0.4)";
          }}
          onMouseOut={e => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 8px 25px rgba(139, 92, 246, 0.3)";
          }}
          onClick={async () => {
            try {
              const address = await connectWallet();
              if (typeof onLogin === 'function') onLogin(address);
            } catch (error) {
              console.error('Failed to connect wallet:', error);
              alert('Failed to connect wallet. Please make sure MetaMask is installed and try again.');
            }
          }}
        >
          METAMASK
          <img src={metamaskIcon} alt="MetaMask" style={{ width: 32, height: 32, objectFit: "contain" }} />
        </button>
        <div style={layoutStyle}>
          <div style={sectionStyle}>
            <div style={sectionIconStyle}>
              <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
                <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,17.4 15.4,18 14.8,18H9.2C8.6,18 8,17.4 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"/>
              </svg>
            </div>
            <h3 style={sectionTitleStyle}>
              Create Content<br />and get<br />rewarded<br />instantly
            </h3>
          </div>
          <div style={imageStyle}>
            <img src={mainImage} alt="Nounce Social Platform" style={imgStyle} />
          </div>
          <div style={sectionRightStyle}>
            <div style={sectionIconStyle}>
              <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
                <path d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z"/>
              </svg>
            </div>
            <h3 style={sectionTitleStyle}>
              With the<br />verification on<br />blockchain<br />network, feel<br />safe to dive into<br />the new secure<br />social media
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPageBody;