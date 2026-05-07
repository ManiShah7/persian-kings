type Props = {
  x: number;
  year: number;
};

const YearTick = ({ x, year }: Props) => {
  return (
    <span
      style={{
        position: "absolute",
        left: `${x}px`,
        bottom: "100%",
        transform: "translateY(95%)",
      }}
    >
      |
      <br />
      {year > 0 ? year : `${Math.abs(year)} BC`}
    </span>
  );
};

export default YearTick;
