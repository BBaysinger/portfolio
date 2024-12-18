import React, { useRef, useState, useEffect, useCallback } from "react";

import styles from "./Carousel.module.scss";

// BASE_OFFSET accounts for that HTML elements don't scroll
// to negative scrollLeft. TODO: This can be handled in a way that instead
// repositions the slides and scroll position when the user
// scroll stops. It works, I've done it elsewhere, but it's not critical for
// current use cases. Until then, it's not *technically* infinite scrolling left.
const BASE_OFFSET = 100000;

const Direction = {
  LEFT: "Left",
  RIGHT: "Right",
} as const;

type DirectionType = (typeof Direction)[keyof typeof Direction];

interface CarouselProps {
  slides: React.ReactNode[];
  slideSpacing: number;
  initialIndex?: number;
  onIndexUpdate?: (currentIndex: number) => void;
  debug?: boolean;
  wrapperClassName?: string;
  slideClassName?: string;
  sliderClassName?: string;
  onScrollUpdate?: (scrollLeft: number) => void;
  externalScrollLeft?: number;
  onStableIndex?: (stableIndex: number) => void;
  stabilizationDuration?: number;
}

/**
 * Infinite scolling carousel using native HTML element inertial scroll behavior.
 * React is the only dependency.
 *
 * TODO: This should automatically clone slides when there are not enough
 * to facilitate scrolling.
 *
 * @author Bradley Baysinger
 * @since 2024-12-16
 * @version N/A
 */
const Carousel: React.FC<CarouselProps> = ({
  slides,
  slideSpacing,
  initialIndex = 0,
  onIndexUpdate,
  debug = false,
  wrapperClassName = "",
  slideClassName = "",
  sliderClassName = "",
  onScrollUpdate,
  externalScrollLeft,
  onStableIndex,
  stabilizationDuration = 400,
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [_previousIndex, setPreviousIndex] = useState(NaN);
  const [scrollDirection, setScrollDirection] = useState<DirectionType | null>(
    null,
  );
  const [positions, setPositions] = useState<number[]>([]);
  const [multipliers, setMultipliers] = useState<number[]>([]);
  const stabilizationTimer = useRef<NodeJS.Timeout | null>(null);

  const computePositions = useCallback(
    (direction: DirectionType) => {
      // Keep arrays here to be able to console.log output from here
      // only when they update.
      const newPositions: number[] = [];
      const newMultipliers: number[] = [];

      slides.forEach((_, index) => {
        let multiplier: number = NaN;
        if (direction === Direction.RIGHT) {
          const threshold = 2;
          multiplier = -Math.floor(
            (index - currentIndex + threshold) / slides.length,
          );
        } else if (direction === Direction.LEFT) {
          const threshold = 4;
          multiplier = Math.floor(
            (currentIndex - index + threshold) / slides.length,
          );
        }

        const xPos = Math.round(
          multiplier * slideSpacing * slides.length + index * slideSpacing,
        );

        newMultipliers.push(multiplier);
        newPositions.push(xPos);
      });

      if (debug) {
        console.info(`${direction} multipliers:`, newMultipliers);
        console.info(`${direction} positions:`, newPositions);
      }

      setMultipliers(newMultipliers);
      setPositions(newPositions);
    },
    [slides, currentIndex, slideSpacing, debug],
  );

  useEffect(() => {
    computePositions(Direction.RIGHT);
  }, [computePositions]);

  const handleScroll = useCallback(() => {
    if (!scrollerRef.current) return;

    const scrollLeft = scrollerRef.current.scrollLeft;
    const newIndex = -Math.round((BASE_OFFSET - scrollLeft) / slideSpacing);

    if (newIndex !== currentIndex) {
      const newDirection =
        newIndex > currentIndex ? Direction.RIGHT : Direction.LEFT;

      if (newDirection !== scrollDirection) {
        setScrollDirection(newDirection);
      }
      setPreviousIndex(currentIndex);
      setCurrentIndex(newIndex);

      if (onIndexUpdate) {
        onIndexUpdate(newIndex);
      }

      if (stabilizationTimer.current) {
        clearTimeout(stabilizationTimer.current);
      }
      stabilizationTimer.current = setTimeout(() => {
        if (onStableIndex) {
          const normalizedIndex =
            ((newIndex % slides.length) + slides.length) % slides.length;
          onStableIndex(normalizedIndex);
        }
      }, stabilizationDuration);
    }

    if (onScrollUpdate) {
      onScrollUpdate(scrollLeft - BASE_OFFSET);
    }
  }, [
    currentIndex,
    slideSpacing,
    onIndexUpdate,
    onScrollUpdate,
    scrollDirection,
    onStableIndex,
    stabilizationDuration,
  ]);

  useEffect(() => {
    let animationFrameId: number | null = null;

    const scrollListener = () => {
      if (animationFrameId !== null) return;

      animationFrameId = requestAnimationFrame(() => {
        handleScroll();
        animationFrameId = null;
      });
    };

    const scroller = scrollerRef.current;
    scroller?.addEventListener("scroll", scrollListener);

    return () => {
      scroller?.removeEventListener("scroll", scrollListener);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [handleScroll]);

  useEffect(() => {
    if (scrollDirection) {
      computePositions(scrollDirection);
    }
  }, [scrollDirection, currentIndex, computePositions]);

  // useEffect(() => {
  //   if (scrollerRef.current) {
  //     scrollerRef.current.scrollLeft = BASE_OFFSET;
  //     computePositions(Direction.RIGHT);
  //   }
  // }, []);

  const isSlave = () => typeof externalScrollLeft === "number";
  const offset = () => (isSlave() ? 0 : BASE_OFFSET);

  const slaveTransform = (): string => {
    if (typeof externalScrollLeft === "number") {
      return `translateX(${-externalScrollLeft}px)`;
    } else
      return "";
  };

  const slaveLeft = (): string => {
    if (typeof externalScrollLeft === "number") {
      return `${-externalScrollLeft}px`;
    } else return "0";
  };

  return (
    <div
      className={`
        ${styles["carousel-wrapper"]}
        ${isSlave() ? styles["slave-wrapper"] : ""}
        ${wrapperClassName}
      `}
    >
      <div
        ref={scrollerRef}
        className={`${styles["carousel-slider"]} ${sliderClassName}`}
        style={{ transform: slaveTransform() }}
        // style={{ left: slaveLeft() }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`${styles["carousel-slide"]} ${slideClassName}`}
            style={{
              transform: `translateX(${offset() + positions[index]}px)`,
              // left: offset() + positions[index] + "px",
            }}
          >
            {debug && (
              <div className={styles["debug-info"]}>
                <div>Index: {index}</div>
                <div>Multiplier: {multipliers[index]}</div>
                <div>xPos: {positions[index] + "px"}</div>
              </div>
            )}
            {slide}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
