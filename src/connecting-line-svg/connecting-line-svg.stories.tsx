import Xarrow from "react-xarrows";
import { ConnectingLineSvgCurve } from "./connecting-line-svg-curve";
import { ConnectingLineSvgElbow } from "./connecting-line-svg-elbow";
import { ConnectingLineSvgStraight } from "./connecting-line-svg-straight";
import { TwoPointContainer } from "./two-point";

export default {};

export const Straight = () => {
  return (
    <TwoPointContainer>
      {(args) => {
        if (!args || !args.startPointRef.current || !args.endPointRef.current)
          return null;
        return (
          <ConnectingLineSvgStraight
            startPoint={args.startPointRef.current}
            endPoint={args.endPointRef.current}
          />
        );
      }}
    </TwoPointContainer>
  );
};

export const Curve = () => {
  return (
    <TwoPointContainer>
      {(args) => {
        if (!args || !args.startPointRef.current || !args.endPointRef.current)
          return null;
        return (
          <ConnectingLineSvgCurve
            startPoint={args.startPointRef.current}
            endPoint={args.endPointRef.current}
          />
        );
      }}
    </TwoPointContainer>
  );
};

export const Elbow = () => {
  return (
    <TwoPointContainer>
      {(args) => {
        if (!args || !args.startPointRef.current || !args.endPointRef.current)
          return null;
        return (
          <ConnectingLineSvgElbow
            startPoint={args.startPointRef.current}
            endPoint={args.endPointRef.current}
          />
        );
      }}
    </TwoPointContainer>
  );
};

export const ReactXarrows = () => {
  return (
    <TwoPointContainer>
      {(args) => {
        if (!args || !args.startPointRef.current || !args.endPointRef.current)
          return null;

        return (
          <Xarrow
            start={args.startPointRef}
            end={args.endPointRef}
            labels={{
              start: "start",
              middle: "middle",
              end: "end",
            }}
            startAnchor="right"
            endAnchor="left"
            color="magenta"
            strokeWidth={2.2}
            curveness={1}
            dashness={{ animation: true, strokeLen: 7, nonStrokeLen: 3 }}
          />
        );
      }}
    </TwoPointContainer>
  );
};
