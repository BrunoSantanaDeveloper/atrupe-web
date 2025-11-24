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

export const DocumentIcon = (_props: SVGProps) => (
  <Svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="#fff"
    stroke="#475467"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: 12, height: 12 }}
  >
    <Path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <Path d="M14 3v4a1 1 0 0 0 1 1h4" />
    <Path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
    <Path d="M9 9l1 0" />
    <Path d="M9 13l6 0" />
    <path d="M9 17l6 0" />
  </Svg>
)

export const PhoneIcon = (_props: SVGProps) => (
  <Svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="#fff"
    stroke="#475467"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: 12, height: 12 }}
  >
    <Path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <Path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
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

export const WebsiteIcon = (_props: SVGProps) => (
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
    <Path d="M3.6 9h16.8" />
    <Path d="M3.6 15h16.8" />
    <Path d="M11.5 3a17 17 0 0 0 0 18" />
    <Path d="M12.5 3a17 17 0 0 1 0 18" />
  </Svg>
)

export const EmailIcon = (_props: SVGProps) => (
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
    <Path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
    <Path d="M3 7l9 6l9 -6" />
  </Svg>
)

export const InstagramIcon = (_props: SVGProps) => (
  <Svg
    viewBox="0 0 10 10"
    style={{ width: 12, height: 12 }}
    fill="none"
    stroke="#475467"
    strokeWidth={1}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path
      fill="none"
      d="M6.87508 3.12484V3.129M1.66675 3.33317C1.66675 2.89114 1.84234 2.46722 2.1549 2.15466C2.46746 1.8421 2.89139 1.6665 3.33341 1.6665H6.66675C7.10878 1.6665 7.5327 1.8421 7.84526 2.15466C8.15782 2.46722 8.33341 2.89114 8.33341 3.33317V6.6665C8.33341 7.10853 8.15782 7.53245 7.84526 7.84501C7.5327 8.15758 7.10878 8.33317 6.66675 8.33317H3.33341C2.89139 8.33317 2.46746 8.15758 2.1549 7.84501C1.84234 7.53245 1.66675 7.10853 1.66675 6.6665V3.33317ZM3.75008 4.99984C3.75008 5.33136 3.88178 5.6493 4.1162 5.88372C4.35062 6.11814 4.66856 6.24984 5.00008 6.24984C5.3316 6.24984 5.64954 6.11814 5.88396 5.88372C6.11839 5.6493 6.25008 5.33136 6.25008 4.99984C6.25008 4.66832 6.11839 4.35037 5.88396 4.11595C5.64954 3.88153 5.3316 3.74984 5.00008 3.74984C4.66856 3.74984 4.35062 3.88153 4.1162 4.11595C3.88178 4.35037 3.75008 4.66832 3.75008 4.99984Z"
    />
  </Svg>
)

export const FacebookIcon = (_props: SVGProps) => (
  <Svg
    viewBox="0 0 10 10"
    style={{ width: 12, height: 12 }}
    fill="none"
    stroke="#475467"
    strokeWidth={1}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path
      fill="none"
      d="M2.91675 4.16667V5.83333H4.16675V8.75H5.83341V5.83333H7.08341L7.50008 4.16667H5.83341V3.33333C5.83341 3.22283 5.87731 3.11685 5.95545 3.03871C6.03359 2.96057 6.13957 2.91667 6.25008 2.91667H7.50008V1.25H6.25008C5.69755 1.25 5.16764 1.46949 4.77694 1.86019C4.38624 2.25089 4.16675 2.7808 4.16675 3.33333V4.16667H2.91675Z"
    />
  </Svg>
)

export const LinkedinIcon = (_props: SVGProps) => (
  <Svg
    viewBox="0 0 10 10"
    style={{ width: 12, height: 12 }}
    fill="none"
    stroke="#475467"
    strokeWidth={1}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path
      fill="none"
      d="M2.33341 3.58317V5.6665M2.33341 2.33317V2.33734M4.00008 5.6665V3.58317M5.66675 5.6665V4.4165C5.66675 4.19549 5.57895 3.98353 5.42267 3.82725C5.26639 3.67097 5.05443 3.58317 4.83341 3.58317C4.6124 3.58317 4.40044 3.67097 4.24416 3.82725C4.08788 3.98353 4.00008 4.19549 4.00008 4.4165M0.666748 1.49984C0.666748 1.27882 0.754545 1.06686 0.910826 0.910582C1.06711 0.754301 1.27907 0.666504 1.50008 0.666504H6.50008C6.72109 0.666504 6.93306 0.754301 7.08934 0.910582C7.24562 1.06686 7.33341 1.27882 7.33341 1.49984V6.49984C7.33341 6.72085 7.24562 6.93281 7.08934 7.08909C6.93306 7.24537 6.72109 7.33317 6.50008 7.33317H1.50008C1.27907 7.33317 1.06711 7.24537 0.910826 7.08909C0.754545 6.93281 0.666748 6.72085 0.666748 6.49984V1.49984Z"
    />
  </Svg>
)
