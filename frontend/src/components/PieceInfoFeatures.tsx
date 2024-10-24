import React, { ReactNode } from "react";

import "./PieceInfoFeatures.scss";

interface PortfolioPieceData {
  desc: string[];
  urls: Map<string, string[] | string>;
  role: string;
}

interface PieceInfoFeaturesProps {
  transition: string;
  pieceData: PortfolioPieceData;
}

/**
 * Display and animate the descriptions, features, and urls/buttons of each portfolio item.
 *
 * TODO: Could this be more pure if we separated these out to two components?...
 *
 * @author Bradley Baysinger
 * @since The beginning of time.
 * @version N/A
 */
export default class PieceInfoFeatures extends React.Component<PieceInfoFeaturesProps> {
  /**
   *
   *
   * @memberof PieceInfoFeatures
   */
  peiceData = null;

  /**
   * Need a reference to allow parent component access to computed height of div.
   *
   *
   * @memberof PieceInfoFeatures
   */
  public domElem: HTMLElement | null = null;

  /**
   *
   *
   * @memberof PieceInfoFeatures
   */
  transition = null;

  /**
   *
   *
   * @memberof PieceInfoFeatures
   */
  members: Array<HTMLElement | null> = [];

  /**
   *
   *
   * @memberof PieceInfoFeatures
   */
  timesUpdated = 0;

  /**
   *
   *
   * @returns
   * @memberof PieceInfoFeatures
   */
  shouldComponentUpdate() {
    // HERE: https://medium.com/@User3141592/react-gotchas-and-best-practices-2d47fd67dd22
    this.timesUpdated++;

    if (this.timesUpdated > 0) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * TODO: Figure out why this member doesn't exist on refs at runtime.
   *
   * @readonly
   * @memberof PieceInfoFeatures
   */
  get height() {
    return this.domElem?.offsetHeight;
  }

  /**
   *
   *
   * @memberof PieceInfoFeatures
   */
  addMember = (member: HTMLElement | null) => {
    if (member && this.members) {
      this.members.push(member);
      member.style.transitionDelay =
        this.members.length * 0.0 + "s, " + this.members.length * 0.01 + "s";
      member.style.transitionDuration =
        this.members.length * 0.2 + "s, " + this.members.length * 0.2 + "s";
    } else {
      // TODO: Is this a problem?
      console.log("eh?");
    }
  };

  /**
   *
   *
   * @memberof PieceInfoFeatures
   */
  componentWillUnmount() {
    setTimeout(() => {
      // Garbage collect.
      this.members = [];
    }, 0);
  }

  /**
   *
   *
   * @returns
   * @memberof PieceInfoFeatures
   */
  render() {
    const pieceData: PortfolioPieceData = this.props.pieceData;
    const { desc, urls, role } = pieceData;

    const descs = desc.map((htmlContent, index) => (
      <div
        key={index}
        ref={this.addMember}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    ));

    const urlBtns: ReactNode = Object.entries(urls).map(([label, urls]) => {
      if (Array.isArray(urls)) {
        return (
          <span className="btn-group" ref={this.addMember} key={label}>
            <span className="btn btn-group-label">{label}</span>
            {urls.map((item, index) => (
              <a key={item} href={item} className="btn">
                {index + 1}
              </a>
            ))}
          </span>
        );
      } else if (typeof urls === "string") {
        return (
          <a className="btn" href={urls} ref={this.addMember} key={urls}>
            {label}
          </a>
        );
      } else {
        throw new Error("Type must be string[] or string.");
      }
    });

    return (
      <div
        id="piece-info-and-features"
        className="info container"
        ref={(domElem) => {
          this.addMember(domElem);
          this.domElem = domElem;
        }}
      >
        <div className="desc-paragraphs">
          {descs}
          {role && (
            <div ref={this.addMember}>
              <p>
                <span>Role:</span> {role}
              </p>
            </div>
          )}
        </div>
        <div className="url-btns">{urlBtns}</div>
      </div>
    );
  }
}
