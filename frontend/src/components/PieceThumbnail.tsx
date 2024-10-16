import React from "react";
import { Link } from "react-router-dom";
import Sniffer from "../utils/Sniffer";

interface PieceThumbnailProps {
  focused: boolean;
  key: string; //facebook.github.io/react/docs/multiple-components.html#dynamic-children
  index: number;
  omitFromList: boolean;
  pieceId: string;
  title: string;
  clientId: string;
  property: string;
  shortDesc: string;
  desc: string;
}

/**
 * The thumbnails in the portfolio/home that each link out to a specific portfolio piece.
 *
 * @author Bradley Baysinger
 * @since The beginning of time.
 * @version N/A
 */
export default class PieceThumbnail extends React.Component<PieceThumbnailProps> {
  /**
   *
   *
   * @returns
   * @memberof PieceThumbnail
   */
  render() {
    const { pieceId, title, clientId } = this.props;

    const style = {
      backgroundImage: "url('/images/thumbs/" + pieceId + ".jpg')",
    };

    const focus = this.props.focused ? "piece-thumbnail-focus" : "";
    const hoverEnabled = !Sniffer.mobile ? "hover_enabled" : "";

    return (
      <div
        className={
          "piece-thumbnail " +
          focus +
          " " +
          hoverEnabled
        }
        style={style}
      >
        <Link to={"/portfolio/" + pieceId}>
          <div className="vingette"></div>
          <div className="thumb-content">
            <img
              src={"/images/client-logos/" + clientId + ".png"}
              className="client-logo"
              alt={clientId + " logo"}
            />
            <h4 className="thumb-title">{title}</h4>
          </div>
        </Link>
      </div>
    );
  }
}
