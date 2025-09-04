import { StickyLeftTopRightByDiv } from "./sticky-left-top-right-by-div";
import { StickyLeftTopRightByTable } from "./sticky-left-top-right-by-table";

export default {};

export const Table = () => {
  return <StickyLeftTopRightByTable />;
};

export const Div = () => {
  return <StickyLeftTopRightByDiv />;
};
