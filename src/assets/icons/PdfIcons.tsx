import { Svg, Path, SVGProps } from '@react-pdf/renderer'

export const MoneySignIcon = (_props: SVGProps) => (
  <Svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    stroke="#475467"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <Path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
    <Path d="M14.8 9a2 2 0 0 0 -1.8 -1h-2a2 2 0 1 0 0 4h2a2 2 0 1 1 0 4h-2a2 2 0 0 1 -1.8 -1" />
    <Path d="M12 7v10" />
  </Svg>
)

export const TruckDeliveryIcon = (props: SVGProps) => (
  <Svg viewBox="0 0 24 24" style={{ width: 15.67, height: 12.33 }} {...props}>
    <Path
      stroke="#475467"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0M15 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0"
    />
    <Path
      stroke="#475467"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 17H3v-4M2 5h11v12m-4 0h6m4 0h2v-6h-8m0-5h5l3 5M3 9h4"
    />
  </Svg>
)
