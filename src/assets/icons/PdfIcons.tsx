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

export const CalendarDollarIcon = (props: SVGProps) => (
  <Svg viewBox="0 0 16 16" style={{ width: 12, height: 12 }} {...props}>
    <Path
      stroke="#475467"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.6665 14.6H3.99984C3.64622 14.6 3.30708 14.4595 3.05703 14.2095C2.80698 13.9594 2.6665 13.6203 2.6665 13.2666V5.26664C2.6665 4.91302 2.80698 4.57388 3.05703 4.32383C3.30708 4.07378 3.64622 3.93331 3.99984 3.93331H11.9998C12.3535 3.93331 12.6926 4.07378 12.9426 4.32383C13.1927 4.57388 13.3332 4.91302 13.3332 5.26664V7.26664M10.6665 2.59998V5.26664M5.33317 2.59998V5.26664M2.6665 7.93331H10.9998M13.9998 10.6H12.3332C12.068 10.6 11.8136 10.7053 11.6261 10.8929C11.4385 11.0804 11.3332 11.3348 11.3332 11.6C11.3332 11.8652 11.4385 12.1195 11.6261 12.3071C11.8136 12.4946 12.068 12.6 12.3332 12.6H12.9998C13.2651 12.6 13.5194 12.7053 13.7069 12.8929C13.8945 13.0804 13.9998 13.3348 13.9998 13.6C13.9998 13.8652 13.8945 14.1195 13.7069 14.3071C13.5194 14.4946 13.2651 14.6 12.9998 14.6H11.3332M12.6665 14.6V15.2666M12.6665 9.93331V10.6"
    />
  </Svg>
)
