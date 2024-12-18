import React from "react";

import NavBar from "components/layout/NavBar";
import headerLogo from "images/main-header/bb_gradient.png";
import caret from "images/main-header/caret.png";
import "components/layout/Header.scss";

interface HeaderMainState {
  height: number;
  caretAnimationStyle: string;
}

export default class HeaderMain extends React.Component<{}, HeaderMainState> {
  static MARGIN_TOP = 26;

  scrolled = false;
  animationFrame: number = 0;

  constructor(props: {}) {
    super(props);
    this.state = {
      height: this.getHeight(),
      caretAnimationStyle: "",
    };
  }

  getHeight = () => {
    return Math.max(window.innerHeight, 500);
  };

  stopCaret() {
    if (!this.scrolled) {
      this.setState({ caretAnimationStyle: "none" });
      this.scrolled = true;
    }
  }

  scrollDown = () => {
    this.stopCaret();
    const targetY = this.getHeight() - NavBar.HEIGHT + 3;
    this.smoothScrollTo(targetY, 500);
  };

  smoothScrollTo = (targetY: number, duration: number) => {
    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    const scrollAnimation = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Pure ease-out formula
      const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

      window.scrollTo(0, startY + distance * easeOut);

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(scrollAnimation);
      }
    };

    this.animationFrame = requestAnimationFrame(scrollAnimation);
  };

  handleResize = () => {
    setTimeout(() => {
      this.setState({ height: this.getHeight() });
    }, 0);
  };

  handleScroll = () => {
    this.stopCaret();
  };

  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
    cancelAnimationFrame(this.animationFrame);
  }

  render() {
    return (
      <header
        id="header"
        className="header_main header"
        style={{
          minHeight: this.state.height + "px",
        }}
      >
        <div className="overheadFill"></div>

        <img src={headerLogo} className="header-logo" alt="BB Logo" />
        <h1>
          <span className="firstName">Bradley</span>{" "}
          <span className="lastName">Baysinger</span>
        </h1>

        <h5 className="subhead">
          <span style={{ lineHeight: "26px" }}>
            Interactive&nbsp;Web &bull;{" "}
            <span className="nobr">Front-end Developer</span>
          </span>
        </h5>

        <div
          className="view_portfolio"
          style={{ animation: this.state.caretAnimationStyle }}
        >
          <div>
            <a href="#list">
              <h6>View Portfolio</h6>
              <img
                src={caret}
                width="50"
                height="30"
                className="caret-img"
                alt=""
              />
            </a>
          </div>
        </div>
        <div id="top"></div>
      </header>
    );
  }
}
