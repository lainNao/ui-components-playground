import { StickyLeftTopRightBottomByDiv } from "./sticky-left-top-right-bottom-by-div";
import { StickyLeftTopRightBottomByTable } from "./sticky-left-top-right-bottom-by-table";

export default {};

export const Table = () => {
  return <StickyLeftTopRightBottomByTable />;
};

export const Div = () => {
  return <StickyLeftTopRightBottomByDiv />;
};
