import CheckBox from "./checkBox";
// import FontList from "./fontList";
const { widget } = figma;
const { AutoLayout, Text, Rectangle, useSyncedState, useEffect, Input, SVG, Fragment, Image } = widget;

const uploadSvg = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" width="32" height="32" x="0" y="0" viewBox="0 0 24 24" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M13.25 16h-2.5c-.689 0-1.25-.561-1.25-1.25V9H6.75a.75.75 0 0 1-.542-1.268l5.25-5.5a.774.774 0 0 1 1.085 0l5.25 5.5A.75.75 0 0 1 17.25 9H14.5v5.75c0 .689-.561 1.25-1.25 1.25zM22.25 22H1.75C.785 22 0 21.215 0 20.25v-.5C0 18.785.785 18 1.75 18h20.5c.965 0 1.75.785 1.75 1.75v.5c0 .965-.785 1.75-1.75 1.75z" fill="#ffffff" data-original="#ffffff" class=""></path></g></svg>`;
const loadSvg = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" width="32" height="32" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="m504.554 233.704-76.447 91.467c-6.329 7.572-15.417 11.479-24.571 11.479a31.872 31.872 0 0 1-20.504-7.447l-91.467-76.447c-13.561-11.334-15.366-31.515-4.032-45.075s31.515-15.366 45.075-4.032l37.506 31.347c-10.274-74.891-74.668-132.774-152.337-132.774C132.984 102.223 64 171.207 64 256s68.984 153.777 153.777 153.777c17.673 0 32 14.327 32 32s-14.327 32-32 32c-58.17 0-112.859-22.653-153.991-63.785C22.653 368.859 0 314.17 0 256s22.653-112.859 63.786-153.992c41.132-41.132 95.821-63.785 153.991-63.785s112.859 22.653 153.992 63.785c32.517 32.516 53.471 73.508 60.829 117.991l22.849-27.339c11.334-13.56 31.515-15.364 45.075-4.032 13.56 11.335 15.365 31.516 4.032 45.076z" fill="#ffffff" data-original="#ffffff"></path></g></svg>`;
const closeSvg = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" width="32" height="32" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M442.154 145c10.585 0 17.924-10.701 13.955-20.514C442.016 89.645 407.834 65 368 65h-18.414C342.719 28.727 310.916 0 272 0h-32c-38.891 0-70.715 28.708-77.586 65H144c-39.834 0-74.016 24.645-88.109 59.486C51.922 134.299 59.261 145 69.846 145zM240 30h32c21.9 0 40.49 14.734 46.748 35H193.252C199.51 44.734 218.1 30 240 30zM111.053 470.196C112.722 493.638 132.439 512 155.939 512H356.06c23.5 0 43.217-18.362 44.886-41.804L421.969 175H90.031zm185.966-214.945c.414-8.274 7.469-14.655 15.73-14.232 8.274.414 14.646 7.457 14.232 15.73l-8 160c-.401 8.019-7.029 14.251-14.969 14.251-8.637 0-15.42-7.223-14.994-15.749zm-97.768-14.232c8.263-.415 15.317 5.959 15.73 14.232l8 160c.426 8.53-6.362 15.749-14.994 15.749-7.94 0-14.568-6.232-14.969-14.251l-8-160c-.413-8.273 5.959-15.316 14.233-15.73z" fill="#777" data-original="#777" class=""></path></g></svg>`;
const warningSvg = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" width="18" height="18" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M501.609 384.603 320.543 51.265c-13.666-23.006-37.802-36.746-64.562-36.746-26.76 0-50.896 13.74-64.562 36.746-.103.176-.19.352-.293.528L10.662 384.076c-13.959 23.491-14.223 51.702-.719 75.457 13.535 23.769 37.919 37.948 65.266 37.948h360.544c27.347 0 52.733-14.179 66.267-37.948 13.504-23.754 13.241-51.967-.411-74.93zM225.951 167.148c0-16.586 13.445-30.03 30.03-30.03 16.586 0 30.03 13.445 30.03 30.03v120.121c0 16.584-13.445 30.03-30.03 30.03s-30.03-13.447-30.03-30.03V167.148zm30.03 270.273c-24.839 0-45.046-20.206-45.046-45.046 0-24.839 20.206-45.045 45.046-45.045 24.839 0 45.045 20.206 45.045 45.045.001 24.839-20.205 45.046-45.045 45.046z" fill="#F88A0A" data-original="#F88A0A" class=""></path></g></svg>`;
const fontFamilySvg = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" width="24" height="24" x="0" y="0" viewBox="0 0 511.948 511.948" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M370.203 438.175 229.05 73.066a17.503 17.503 0 0 0-16.419-11.299h-54.554a17.654 17.654 0 0 0-16.419 11.299L.592 438.175a8.828 8.828 0 0 0 8.21 12.006h55.702a8.932 8.932 0 0 0 8.298-5.65l29.396-76.977a8.827 8.827 0 0 1 8.21-5.65H260.3a8.932 8.932 0 0 1 8.298 5.65l29.396 76.977a8.827 8.827 0 0 0 8.21 5.65h55.702a8.887 8.887 0 0 0 8.297-12.006zM232.228 300.112h-93.749a9.251 9.251 0 0 1-8.651-12.623l46.874-122.615a9.226 9.226 0 0 1 17.302 0l46.963 122.615a9.341 9.341 0 0 1-8.739 12.623zM511.356 438.175l-71.592-188.469a17.655 17.655 0 0 0-16.508-11.388h-25.6a17.656 17.656 0 0 0-16.508 11.388l-32.132 84.568 21.363 55.437a8.219 8.219 0 0 1 4.59-1.324h70.974a8.83 8.83 0 0 1 8.21 5.561l20.303 50.67a8.827 8.827 0 0 0 8.21 5.561h20.48a8.828 8.828 0 0 0 8.21-12.004zm-79.713-85.098h-42.284a4.46 4.46 0 0 1-4.149-6.18l21.098-52.789a4.414 4.414 0 0 1 8.298 0l21.186 52.789a4.491 4.491 0 0 1-.435 4.191 4.49 4.49 0 0 1-3.714 1.989z" fill="#555555" data-original="#000000"></path></g></svg>`;
const fontStyleSvg = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" width="24" height="24" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M15 114.235c8.284 0 15-6.716 15-15V30h69.235c8.284 0 15-6.716 15-15s-6.716-15-15-15H15C6.716 0 0 6.716 0 15v84.235c0 8.285 6.716 15 15 15zM497 0h-84.235c-8.284 0-15 6.716-15 15s6.716 15 15 15H482v69.235c0 8.284 6.716 15 15 15s15-6.716 15-15V15c0-8.284-6.716-15-15-15zM497 397.765c-8.284 0-15 6.716-15 15V482h-69.235c-8.284 0-15 6.716-15 15s6.716 15 15 15H497c8.284 0 15-6.716 15-15v-84.235c0-8.285-6.716-15-15-15zM99.235 482H30v-69.235c0-8.284-6.716-15-15-15s-15 6.716-15 15V497c0 8.284 6.716 15 15 15h84.235c8.284 0 15-6.716 15-15s-6.715-15-15-15zM419.66 191.38V96.65c0-4.7-3.81-8.51-8.52-8.51H100.86c-4.71 0-8.52 3.81-8.52 8.51v94.73c0 4.71 3.81 8.52 8.52 8.52h45.24c4.7 0 8.51-3.81 8.51-8.52v-32.45a8.52 8.52 0 0 1 8.52-8.52h53.21c4.71 0 8.52 3.81 8.52 8.52v234.14c0 4.71-3.81 8.52-8.52 8.52h-23.27c-4.71 0-8.52 3.81-8.52 8.52v45.24c0 4.7 3.81 8.51 8.52 8.51h125.86c4.71 0 8.52-3.81 8.52-8.51v-45.24c0-4.71-3.81-8.52-8.52-8.52h-23.27c-4.71 0-8.52-3.81-8.52-8.52V158.93c0-4.71 3.81-8.52 8.52-8.52h53.21c4.7 0 8.52 3.81 8.52 8.52v32.45c0 4.71 3.81 8.52 8.51 8.52h45.24c4.71 0 8.52-3.81 8.52-8.52z" fill="#555555" data-original="#000000" class=""></path></g></svg>`;
const fontSizeSvg = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" width="24" height="24" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M0 179.312h66.1V118.8h69.786v274.4H80.292v66.1h177.287v-66.1h-55.593V118.8h69.785v60.512h66.101V52.7H0zM477.853 137.825H512L462.853 52.7l-49.147 85.125h34.147v236.35h-34.147l49.147 85.125L512 374.175h-34.147z" fill="#555555" data-original="#000000"></path></g></svg>`;
const folderSvg = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" width="24" height="24" x="0" y="0" viewBox="0 0 512 511" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M506.04 180.988c-7.782-12.547-21.532-20.047-36.782-20.047H129.695c-16.832 0-32.14 9.489-39.011 24.18L.87 373.43c3.39 13.789 16.27 24.09 31.61 24.09H393.75a40.753 40.753 0 0 0 36.46-22.555l77.63-155.594c6.129-12.312 5.45-26.66-1.8-38.383zm0 0" fill="#555555" data-original="#000000"></path><path d="M72.402 156.156c6.864-14.687 22.176-24.18 39.012-24.18h319.754V91.079c0-16.86-14.223-30.578-31.703-30.578H213.02c-.274 0-.461-.07-.532-.121l-33.37-46.66C173.206 5.44 163.444.5 153.015.5H31.71C14.223.5 0 14.219 0 31.078v276.875zm0 0" fill="#555555" data-original="#000000"></path></g></svg>`;
const nameSvg = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" width="24" height="24" x="0" y="0" viewBox="0 0 32 32" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M31.348 13.8A15.5 15.5 0 0 0 .627 18.015a15.614 15.614 0 0 0 13.31 13.351 16.058 16.058 0 0 0 2.08.136 15.351 15.351 0 0 0 7.972-2.217 1.5 1.5 0 0 0-1.548-2.57 12.5 12.5 0 1 1-4.789-23.109 12.5 12.5 0 0 1 10.162 16.488 2.166 2.166 0 0 1-2.079 1.406 2.238 2.238 0 0 1-2.235-2.235V10a1.5 1.5 0 0 0-3 0v.014a7.5 7.5 0 1 0 .541 11.523 5.224 5.224 0 0 0 4.694 2.963 5.167 5.167 0 0 0 4.914-3.424 15.535 15.535 0 0 0 .699-7.276zM16 20.5a4.5 4.5 0 1 1 4.5-4.5 4.505 4.505 0 0 1-4.5 4.5z" fill="#555555" data-original="#000000" class=""></path></g></svg>`;
const coffeeSvg = `<svg data-v-7970f380="" width="30" height="40" viewBox="0 0 25 35" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.0672 8.1281L22.0437 8.11426L21.9893 8.09766C22.0112 8.11614 22.0386 8.12685 22.0672 8.1281Z" fill="black"></path> <path d="M22.4111 10.5781L22.3848 10.5855L22.4111 10.5781Z" fill="black"></path> <path d="M22.0735 8.11128C22.0708 8.11093 22.0681 8.11029 22.0655 8.10938C22.0654 8.11115 22.0654 8.11293 22.0655 8.1147C22.0685 8.11432 22.0712 8.11313 22.0735 8.11128Z" fill="black"></path> <path d="M22.3877 10.5647L22.4274 10.5421L22.4421 10.5338L22.4555 10.5195C22.4303 10.5304 22.4074 10.5457 22.3877 10.5647Z" fill="black"></path> <path d="M22.1334 8.1762L22.0947 8.1393L22.0684 8.125C22.0825 8.14993 22.1058 8.16832 22.1334 8.1762Z" fill="black"></path> <path d="M12.3836 31.9453C12.3526 31.9587 12.3255 31.9796 12.3047 32.0062L12.3291 31.9905C12.3457 31.9753 12.3693 31.9573 12.3836 31.9453Z" fill="black"></path> <path d="M18.0497 30.8309C18.0497 30.7958 18.0326 30.8023 18.0368 30.9268C18.0368 30.9167 18.0409 30.9065 18.0428 30.8969C18.0451 30.8747 18.0469 30.853 18.0497 30.8309Z" fill="black"></path> <path d="M17.4617 31.9453C17.4307 31.9587 17.4036 31.9796 17.3828 32.0062L17.4073 31.9905C17.4239 31.9753 17.4474 31.9573 17.4617 31.9453Z" fill="black"></path> <path d="M8.39845 32.2145C8.37496 32.1941 8.34619 32.1807 8.31543 32.1758C8.34034 32.1878 8.36524 32.1998 8.38185 32.209L8.39845 32.2145Z" fill="black"></path> <path d="M7.50541 31.3533C7.50173 31.317 7.49058 31.2818 7.47266 31.25C7.48535 31.2831 7.49598 31.317 7.50448 31.3515L7.50541 31.3533Z" fill="black"></path> <path d="M13.5278 15.9814C12.2963 16.5086 10.8987 17.1064 9.08736 17.1064C8.32963 17.1048 7.57558 17.0009 6.8457 16.7973L8.09845 29.6592C8.14279 30.1968 8.38769 30.698 8.78452 31.0634C9.18134 31.4288 9.70106 31.6316 10.2405 31.6315C10.2405 31.6315 12.0167 31.7237 12.6094 31.7237C13.2474 31.7237 15.1601 31.6315 15.1601 31.6315C15.6995 31.6315 16.2191 31.4286 16.6158 31.0633C17.0125 30.6979 17.2574 30.1967 17.3017 29.6592L18.6435 15.4463C18.0439 15.2415 17.4387 15.1055 16.7565 15.1055C15.5767 15.105 14.626 15.5114 13.5278 15.9814Z" fill="#FFDD00"></path> <path d="M2.96582 10.5039L2.98704 10.5237L3.00088 10.532C2.99022 10.5215 2.97847 10.512 2.96582 10.5039Z" fill="black"></path> <path d="M24.4376 9.31226L24.249 8.36071C24.0797 7.50694 23.6955 6.70022 22.8191 6.39164C22.5382 6.29294 22.2195 6.2505 22.0041 6.04617C21.7887 5.84184 21.725 5.5245 21.6752 5.23023C21.583 4.6901 21.4963 4.14952 21.4017 3.61033C21.3201 3.14677 21.2555 2.62602 21.0428 2.20075C20.7661 1.62973 20.1918 1.29579 19.6208 1.07485C19.3282 0.965622 19.0296 0.873222 18.7265 0.798101C17.2998 0.421723 15.7999 0.283349 14.3322 0.204476C12.5705 0.107269 10.8042 0.136556 9.04673 0.292113C7.73863 0.411114 6.36089 0.555024 5.11783 1.00751C4.6635 1.1731 4.19533 1.37189 3.84986 1.7229C3.42597 2.15417 3.2876 2.82113 3.5971 3.35894C3.81711 3.74086 4.1898 4.01069 4.58509 4.18919C5.09997 4.41919 5.63769 4.5942 6.18931 4.71132C7.72526 5.0508 9.3161 5.1841 10.8853 5.24083C12.6245 5.31103 14.3665 5.25414 16.0974 5.07063C16.5254 5.02359 16.9527 4.96716 17.3792 4.90136C17.8815 4.82433 18.2039 4.16751 18.0558 3.70995C17.8787 3.16292 17.4027 2.95074 16.8644 3.0333C16.7851 3.04576 16.7062 3.05729 16.6269 3.06882L16.5697 3.07712C16.3873 3.10019 16.205 3.12171 16.0226 3.1417C15.646 3.18229 15.2683 3.2155 14.8898 3.24133C14.042 3.30037 13.192 3.32758 12.3423 3.32896C11.5075 3.32896 10.6722 3.30544 9.83916 3.25055C9.45909 3.22564 9.07994 3.19397 8.70172 3.15553C8.52967 3.13755 8.35809 3.11864 8.18651 3.09742L8.02322 3.07666L7.98771 3.07159L7.81843 3.04714C7.4725 2.99502 7.12656 2.93506 6.78431 2.86264C6.74978 2.85498 6.71889 2.83577 6.69675 2.80818C6.67461 2.78059 6.66254 2.74627 6.66254 2.71089C6.66254 2.67552 6.67461 2.6412 6.69675 2.61361C6.71889 2.58602 6.74978 2.5668 6.78431 2.55914H6.79077C7.08735 2.49595 7.38624 2.44199 7.68605 2.39494C7.78599 2.37926 7.88623 2.36388 7.98679 2.34881H7.98955C8.17728 2.33636 8.36593 2.30269 8.55274 2.28055C10.178 2.11149 11.813 2.05386 13.4461 2.10804C14.239 2.13111 15.0314 2.17769 15.8206 2.25795C15.9903 2.27548 16.1592 2.29393 16.328 2.31468C16.3926 2.32252 16.4576 2.33175 16.5226 2.33959L16.6536 2.3585C17.0355 2.41539 17.4154 2.48442 17.7934 2.5656C18.3533 2.68737 19.0724 2.72704 19.3215 3.3405C19.4008 3.53514 19.4368 3.75147 19.4806 3.9558L19.5364 4.2164C19.5379 4.22108 19.5389 4.22586 19.5396 4.2307C19.6716 4.8457 19.8036 5.46069 19.9359 6.07569C19.9455 6.12112 19.9458 6.16806 19.9365 6.21359C19.9273 6.25911 19.9087 6.30224 19.8821 6.34028C19.8554 6.37832 19.8212 6.41046 19.7816 6.4347C19.7419 6.45893 19.6977 6.47474 19.6517 6.48113H19.648L19.5673 6.4922L19.4875 6.50281C19.2348 6.53571 18.9817 6.56646 18.7283 6.59506C18.2292 6.65194 17.7294 6.70114 17.2288 6.74265C16.234 6.82537 15.2373 6.87965 14.2385 6.90548C13.7296 6.919 13.2209 6.92531 12.7123 6.92439C10.6878 6.92279 8.66519 6.80513 6.65424 6.57199C6.43653 6.54616 6.21883 6.51849 6.00112 6.49035C6.16993 6.51203 5.87843 6.47375 5.81939 6.46545C5.68101 6.44607 5.54264 6.42593 5.40426 6.40502C4.93979 6.33537 4.47808 6.24958 4.01453 6.1744C3.45411 6.08215 2.91814 6.12827 2.41123 6.40502C1.99513 6.63272 1.65836 6.98188 1.44584 7.40593C1.22721 7.85795 1.16217 8.3501 1.06439 8.8358C0.966604 9.32149 0.814392 9.84408 0.872048 10.3427C0.996123 11.4188 1.74842 12.2933 2.8305 12.4889C3.84848 12.6734 4.87198 12.8228 5.89826 12.9501C9.9297 13.4439 14.0025 13.5029 18.0466 13.1263C18.3759 13.0956 18.7048 13.062 19.0332 13.0258C19.1358 13.0145 19.2396 13.0263 19.337 13.0604C19.4344 13.0944 19.523 13.1498 19.5962 13.2225C19.6694 13.2952 19.7255 13.3834 19.7602 13.4805C19.795 13.5777 19.8075 13.6814 19.797 13.7841L19.6946 14.7794C19.4883 16.7908 19.282 18.802 19.0756 20.813C18.8604 22.9249 18.6437 25.0366 18.4257 27.1482C18.3642 27.7429 18.3027 28.3375 18.2412 28.9319C18.1822 29.5172 18.1739 30.121 18.0627 30.6994C17.8875 31.609 17.2717 32.1675 16.3732 32.3719C15.55 32.5592 14.7091 32.6575 13.8649 32.6652C12.929 32.6703 11.9936 32.6288 11.0578 32.6338C10.0587 32.6394 8.83502 32.5471 8.06381 31.8036C7.38624 31.1505 7.29261 30.1279 7.20036 29.2437C7.07736 28.073 6.95544 26.9025 6.83459 25.7322L6.15656 19.2245L5.71791 15.0137C5.71053 14.9441 5.70315 14.8754 5.69623 14.8053C5.64365 14.303 5.28803 13.8113 4.72761 13.8366C4.24792 13.8579 3.70272 14.2656 3.759 14.8053L4.08417 17.927L4.75667 24.3844C4.94824 26.2187 5.13935 28.0532 5.33 29.888C5.3669 30.2395 5.40149 30.5919 5.44024 30.9434C5.65103 32.864 7.11779 33.899 8.93419 34.1906C9.99506 34.3612 11.0818 34.3963 12.1583 34.4138C13.5384 34.4359 14.9322 34.489 16.2897 34.239C18.3012 33.87 19.8104 32.5268 20.0258 30.4434C20.0873 29.8419 20.1488 29.2403 20.2103 28.6385C20.4148 26.6484 20.619 24.6581 20.8228 22.6677L21.4898 16.1641L21.7956 13.1835C21.8108 13.0357 21.8733 12.8968 21.9736 12.7872C22.0739 12.6776 22.2069 12.6033 22.3528 12.5751C22.928 12.463 23.4778 12.2716 23.8869 11.8339C24.5382 11.137 24.6678 10.2283 24.4376 9.31226ZM2.80098 9.95524C2.80975 9.95109 2.7936 10.0263 2.78669 10.0613C2.7853 10.0083 2.78807 9.96124 2.80098 9.95524ZM2.8568 10.387C2.86141 10.3837 2.87524 10.4022 2.88954 10.4243C2.86786 10.404 2.85403 10.3888 2.85633 10.387H2.8568ZM2.91168 10.4594C2.93152 10.4931 2.94213 10.5143 2.91168 10.4594V10.4594ZM3.02192 10.5489H3.02469C3.02469 10.5521 3.02976 10.5553 3.03161 10.5586C3.02855 10.555 3.02515 10.5518 3.02146 10.5489H3.02192ZM22.326 10.4151C22.1194 10.6116 21.8081 10.7029 21.5004 10.7486C18.0503 11.2606 14.5499 11.5198 11.0619 11.4054C8.56565 11.3201 6.09567 11.0429 3.62431 10.6937C3.38215 10.6596 3.11971 10.6153 2.9532 10.4368C2.63955 10.1001 2.7936 9.42204 2.87524 9.01522C2.94997 8.64253 3.09295 8.14577 3.53621 8.09272C4.22808 8.01155 5.03158 8.30352 5.71607 8.4073C6.54016 8.53306 7.36733 8.63377 8.19758 8.70941C11.7409 9.03229 15.3437 8.98201 18.8713 8.50969C19.5143 8.42329 20.1549 8.32289 20.7933 8.2085C21.362 8.10656 21.9926 7.91515 22.3362 8.50416C22.5719 8.90544 22.6033 9.44233 22.5668 9.89574C22.5556 10.0933 22.4693 10.2791 22.3256 10.4151H22.326Z" fill="black"></path></svg>`;
const searchActive = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" width="46" height="46" x="0" y="0" viewBox="0 0 32 32" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M18.337 18.348c-.851.851-1.98 1.319-3.184 1.319s-2.333-.468-3.184-1.319c-.851-.85-1.318-1.98-1.318-3.183s.468-2.333 1.318-3.184c.851-.851 1.98-1.319 3.184-1.319s2.333.468 3.184 1.319c.851.85 1.318 1.981 1.318 3.184s-.467 2.333-1.318 3.183zm13.601-2.285c0 8.822-7.178 16-16 16s-16-7.178-16-16 7.178-16 16-16 16 7.177 16 16zm-8.881 5.568-2.646-2.653a6.444 6.444 0 0 0 1.244-3.814c0-1.737-.676-3.37-1.904-4.598s-2.86-1.905-4.598-1.905-3.37.677-4.598 1.905-1.904 2.861-1.904 4.598.677 3.37 1.904 4.597a6.459 6.459 0 0 0 4.598 1.905 6.45 6.45 0 0 0 3.849-1.27l2.639 2.646a.995.995 0 0 0 .708.294 1 1 0 0 0 .708-1.705z" fill="#0B68D6" data-original="#0B68D6" class=""></path></g></svg>`;
const searchDisable = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" width="46" height="46" x="0" y="0" viewBox="0 0 32 32" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M18.337 18.348c-.851.851-1.98 1.319-3.184 1.319s-2.333-.468-3.184-1.319c-.851-.85-1.318-1.98-1.318-3.183s.468-2.333 1.318-3.184c.851-.851 1.98-1.319 3.184-1.319s2.333.468 3.184 1.319c.851.85 1.318 1.981 1.318 3.184s-.467 2.333-1.318 3.183zm13.601-2.285c0 8.822-7.178 16-16 16s-16-7.178-16-16 7.178-16 16-16 16 7.177 16 16zm-8.881 5.568-2.646-2.653a6.444 6.444 0 0 0 1.244-3.814c0-1.737-.676-3.37-1.904-4.598s-2.86-1.905-4.598-1.905-3.37.677-4.598 1.905-1.904 2.861-1.904 4.598.677 3.37 1.904 4.597a6.459 6.459 0 0 0 4.598 1.905 6.45 6.45 0 0 0 3.849-1.27l2.639 2.646a.995.995 0 0 0 .708.294 1 1 0 0 0 .708-1.705z" fill="#888" data-original="#888" class=""></path></g></svg>`;

function Widget() {
	
	useEffect(() => {
		if (isFirstLoadFont && localFonts.length === 0) {
			loadLocalFont();
			setIsFirstLoadFont(false);
		}
		if (hasReloadLocalFont) {
			getLocalTextStyle();
			setHasReloadLocalFont(false);
		}
	});
	const [textStyles, setTextStyles] = useSyncedState<any[]>("textStyles", []);

	const [filterStyles, setFilterStyles] = useSyncedState<any[]>("filterStyles", []);

	const [searchName, setSearchName] = useSyncedState("searchName", "");
	const [searchGroup, setSearchGroup] = useSyncedState("searchGroup", "");
	const [searchFamily, setSearchFamily] = useSyncedState("searchFamily", "");
	const [searchStyle, setSearchStyle] = useSyncedState("searchStyle", "");
	const [searchFontSize, setSearchFontSize] = useSyncedState("searchFontSize", "");

	const [checkedGroup, setCheckedGroup] = useSyncedState("checkedGroup", "");
	const [checkedFamily, setCheckedFamily] = useSyncedState("checkedFamily", "");
	const [checkedStyle, setCheckedStyle] = useSyncedState("checkedStyle", "");
	const [checkedFontSize, setCheckedFontSize] = useSyncedState("checkedFontSize", "");

	const [stylesChecked, setStylesChecked] = useSyncedState<string[]>("stylesChecked", []);
	const [hasCheckAll, setHasCheckAll] = useSyncedState<boolean>("hasCheckAll", false);

	const [cacheStyle, setCacheStyle] = useSyncedState<any[]>("cacheStyle", []);

	const [isFirstLoadFont, setIsFirstLoadFont] = useSyncedState("isFirstLoadFont", true);
	const [localFonts, setLocalFonts] = useSyncedState<any[]>("localFonts", []);
	const [cleanFont, setCleanFont] = useSyncedState<any[]>("cleanFont", []);

	const [hasReloadLocalFont, setHasReloadLocalFont] = useSyncedState("hasReloadLocalFont", false);

	const [cacheFontLoad, setCacheFontLoad] = useSyncedState<any[]>("cacheFontLoad", []);

	const [isOpenSearchBar, setIsOpenSearchBar] = useSyncedState("isOpenSearchBar", true);

	const loadLocalFont = () => {
		figma.listAvailableFontsAsync().then((fonts) => {
			setLocalFonts(fonts);
			fontsClean(fonts);
			// console.log(fonts)
		});
	};

	const [newStyle, setNewStyle] = useSyncedState("newStyle", {
		name: "",
		fontName: {
			family: "",
			style: "",
		},
		fontSize: 16,
		description: "",
	});

	useEffect(() => {
		figma.ui.onmessage = (msg) => {
			if (msg.type === "setFont") {
				// console.log(msg)
				setCheckedFamily(msg.data)
			}
			if (msg.type === "close") {
				figma.closePlugin();
			}
		};
	});

	// const [findKeys, setFindKeys] = useSyncedState("findKeys", { family: "", style: "" });

	const toggleSearchBar = () => {
		setIsOpenSearchBar((prev) => !prev);
	};

	const fontsClean = (fonts: any) => {
		let fontFamily = "";
		let data = [];
		let fontStyles = [];
		for (let font of fonts) {
			if (fontFamily === font.fontName.family) {
				fontStyles.push(font.fontName.style);
			} else {
				data.push({ family: fontFamily, styles: fontStyles });
				fontStyles = [font.fontName.style];
				fontFamily = font.fontName.family;
			}
		}

		setCleanFont(data);
		// console.log(data);
	};

	const getLocalTextStyle = () => {
		const styles: any[] = figma.getLocalTextStyles();
		// console.log(styles);
		const data = styles ? styles.map((style) => getDataStyle(style.id)) : [];
		// console.log(data)
		setTextStyles(data);
		setCacheStyle(data);
		setFilterStyles(data);
	};

	// const addCacheFonts = (styles:any) => {
	// 	let data = []
	// 	let font = ""
	// 	for (let style of styles) {
	// 		if (style.fontName.family !== font) {
	// 			font = style.fontName.family
	// 		} else {

	// 		}
	// 	}
	// }

	const getDataStyle = (id: string) => {
		const data: any = figma.getStyleById(id);

		if (data) {
			return {
				id: data?.id,
				name: data?.name,
				fontName: {
					family: data?.fontName?.family,
					style: data?.fontName?.style,
				},
				fontSize: data.fontSize,
				description: data.description,
			};
		} else {
			return null;
		}
	};

	const handleCheck = (id: string) => {
		const hasStyleInList = stylesChecked.find((idStyle) => idStyle === id) ? true : false;
		if (hasStyleInList) {
			if (stylesChecked.length === filterStyles.length) {
				setHasCheckAll(false);
			}
			setStylesChecked((prev) => prev.filter((idStyle) => idStyle !== id));
		} else {
			if (stylesChecked.length === filterStyles.length - 1) {
				setHasCheckAll(true);
			}
			setStylesChecked((prev) => [...prev, id]);
		}
	};

	const handleCheckAll = () => {
		setHasCheckAll((prev) => {
			if (!prev) {
				setStylesChecked(filterStyles.map((style) => style.id));
			} else {
				setStylesChecked([]);
			}

			return !prev;
		});
	};

	const updateStyle = () => {
		for (let style of filterStyles) {
			try {
				const cache = cacheStyle.find((i) => i.id === style.id);
				if (cache) {
					const textStyle: any = figma.getStyleById(style.id);

					// console.log(textStyle);
					if (cache.name !== style.name) {
						textStyle.name = cache.name;
					}
					if (cache.description !== style.description) {
						textStyle.description = cache.description;
					}
					if (cache.fontName.family !== style.fontName.family || cache.fontName.style !== style.fontName.style) {
						figma.loadFontAsync({ ...cache.fontName }).then((res) => {
							textStyle.fontName = { ...cache.fontName };
						});
					}
					if (cache.fontSize !== style.fontSize) {
						figma.loadFontAsync({ ...cache.fontName }).then((res) => {
							textStyle.fontSize = cache.fontSize;
						});
					}
				}
			} catch (err) {
				console.log(err);
			}
		}
		setSearchGroup("");
		setSearchName("");
		setSearchFamily("");
		setSearchStyle("");
		setSearchFontSize("");
		setCheckedFamily("");
		setCheckedGroup("");
		setCheckedStyle("");
		setCheckedFontSize("");
		setFilterStyles(textStyles);
		setCacheStyle(textStyles);
		setStylesChecked([]);
		setHasCheckAll(false);
		setHasReloadLocalFont(true);
	};

	const checkFontName = (font: any) => {
		// const regex = new RegExp(font.fontName.family, "i");
		const res = localFonts.filter((fontLocal) => font.fontName.family === fontLocal.fontName.family);
		// console.log(res)
		if (res.length !== 0) {
			// const regex = new RegExp(font.fontName.style, "i");
			const style = res.filter((fontLocal) => font.fontName.style === fontLocal.fontName.style);
			if (style.length !== 0) {
				return { check: true };
			} else {
				return { check: false, status: "style" };
			}
		} else {
			return { check: false, status: "family" };
		}
	};

	const createStyle = () => {
		const check = checkFontName(newStyle);
		if (check.check) {
			try {
				figma.loadFontAsync({ ...newStyle.fontName }).then((res) => {
					const style = figma.createTextStyle();
					style.name = newStyle.name;
					style.fontName = { ...newStyle.fontName };
					style.fontSize = newStyle.fontSize;
					style.description = newStyle.description;

					setNewStyle({
						name: "",
						fontName: {
							family: "",
							style: "",
						},
						fontSize: 16,
						description: "",
					});
				});
			} catch (err) {
				console.log(err);
			} finally {
				getLocalTextStyle();
			}
		} else {
			console.log("not find " + check.status);
		}
	};

	const getNameStyle = (name: string): string => {
		const lastDirectoryPart = name.lastIndexOf("/");

		if (lastDirectoryPart === -1) {
			return name.trim();
		} else {
			const nameStyle = name.slice(lastDirectoryPart + 1);
			return nameStyle.trim();
		}
	};
	const getGroupStyle = (name: string): string => {
		const lastDirectoryPart = name.lastIndexOf("/");

		if (lastDirectoryPart === -1) {
			return "";
		} else {
			const groupStyle = name.slice(0, lastDirectoryPart);
			return groupStyle.trim();
		}
	};

	const findAll = (data: { group: string; name: string; family: string; style: string; fontSize: number }) => {
		let styles = [...textStyles];
		if (data.group !== "") {
			styles = styles.filter((style) => {
				const regex = new RegExp(data.group, "i");
				const groupStyle = getGroupStyle(style.name);
				return regex.test(groupStyle);
			});
		}

		if (data.name !== "") {
			styles = styles.filter((style) => {
				const regex = new RegExp(data.name, "i");
				const nameStyle = getNameStyle(style.name);
				return regex.test(nameStyle);
			});
		}

		if (data.family !== "") {
			styles = styles.filter((style) => style.fontName.family === data.family);
		}

		if (data.style !== "") {
			styles = styles.filter((style) => style.fontName.style === data.style);
		}

		if (data.fontSize !== 0 || isNaN(data.fontSize)) {
			styles = styles.filter((style) => style.fontSize === data.fontSize);
		}

		setFilterStyles(styles);
		setCacheStyle(styles);
		setStylesChecked([]);
		setHasCheckAll(false);
	};

	const clearSearch = () => {
		setSearchGroup("");
		setSearchName("");
		setSearchFamily("");
		setSearchStyle("");
		setSearchFontSize("");
		setFilterStyles(textStyles);
		setCacheStyle(textStyles);
		setStylesChecked([]);
		setHasCheckAll(false);
	};

	const handleSearch = () => {
		findAll({
			group: searchGroup,
			name: searchName,
			family: searchFamily,
			style: searchStyle,
			fontSize: Number(searchFontSize),
		});
	};

	const handleChangeSelectedStyle = () => {
		// console.log(stylesChecked)
		if (stylesChecked.length !== 0) {
			for (let style of stylesChecked) {
				const cache = cacheStyle.find((i) => i.id === style);
				// console.log(cache);
				if (checkedGroup != "") {
					cache.name = checkedGroup + "/" + getNameStyle(cache.name);
				}
				if (checkedFamily != "") {
					cache.fontName.family = checkedFamily;
				}
				if (checkedStyle != "") {
					cache.fontName.style = checkedStyle;
				}
				if (checkedFontSize != "" || isNaN(Number(checkedFontSize))) {
					cache.fontSize = Number(checkedFontSize);
				}
				setCacheStyle((prev) => prev.map((i) => (i.id === style ? cache : i)));
			}
		}
	};

	const showUi = (moduleName: string, name: string, data?: any) =>
		new Promise((resolve) => {
			figma.showUI(__html__, {
				width: 300,
				height: 300,
				title: name,
			});
			figma.ui.postMessage({ moduleName, data });
		});

	return (
		<AutoLayout
			width={1800}
			height={"hug-contents"}
			fill={"#fff"}
			padding={{
				top: 60,
				right: 36,
				left: 36,
				bottom: 50,
			}}
			spacing={42}
			direction={"vertical"}
			cornerRadius={24}
			overflow={"scroll"}
			// canvasStacking={"first-on-top"}
		>
			<Text onClick={() => showUi("choiceFont", "font", cleanFont)}>aaaa</Text>
			<AutoLayout width={"fill-parent"} horizontalAlignItems={"center"} direction={"vertical"} padding={{ bottom: 6 }}>
				<Text fontSize={46} fontWeight={700}>
					FONT STYLES MANAGER
				</Text>
				<Text fontSize={18}>Choose styles you want to change.</Text>
			</AutoLayout>

			<AutoLayout positioning={"absolute"} x={1815} y={120} width={82}>
				<AutoLayout
					width={"fill-parent"}
					cornerRadius={16}
					spacing={24}
					padding={16}
					fill={"#ffffff"}
					horizontalAlignItems={"center"}
					direction={"vertical"}
				>
					<SVG
						src={isOpenSearchBar ? searchActive : searchDisable}
						onClick={toggleSearchBar}
						tooltip={isOpenSearchBar ? "Hidden search tool" : "Show search tool"}
					/>
					<SVG src={coffeeSvg} tooltip={"Buy me a coffee"} onClick={() => showUi("buyCoffee", "Buy me a coffee")} />
				</AutoLayout>
			</AutoLayout>

			{isOpenSearchBar && (
				<AutoLayout spacing={12} verticalAlignItems={"end"} width={"fill-parent"}>
					<AutoLayout
						padding={10}
						verticalAlignItems={"center"}
						horizontalAlignItems={"center"}
						onClick={() => clearSearch()}
						tooltip={"Clear search"}
					>
						<SVG src={closeSvg} />
					</AutoLayout>
					<AutoLayout spacing={12} width={1360} verticalAlignItems={"end"}>
						<AutoLayout width={470} spacing={12} direction={"vertical"}>
							<AutoLayout
								padding={16}
								fill={"#eee"}
								cornerRadius={8}
								spacing={12}
								verticalAlignItems={"end"}
								stroke={"#ccc"}
								strokeWidth={1}
								width={"fill-parent"}
							>
								<SVG src={folderSvg} />
								<Input
									fontSize={22}
									value={searchGroup}
									onTextEditEnd={(e) => setSearchGroup(e.characters)}
									placeholder="Find group style"
									width={"fill-parent"}
								/>
							</AutoLayout>
							<AutoLayout
								padding={16}
								fill={"#eee"}
								cornerRadius={8}
								spacing={12}
								verticalAlignItems={"end"}
								stroke={"#ccc"}
								strokeWidth={1}
								width={"fill-parent"}
							>
								<SVG src={nameSvg} />
								<Input
									fontSize={22}
									value={searchName}
									onTextEditEnd={(e) => setSearchName(e.characters)}
									placeholder="Find name style"
									width={"fill-parent"}
								/>
							</AutoLayout>
						</AutoLayout>

						<AutoLayout
							padding={16}
							fill={"#eee"}
							cornerRadius={8}
							spacing={12}
							verticalAlignItems={"end"}
							stroke={"#ccc"}
							strokeWidth={1}
							width={"fill-parent"}
						>
							<SVG src={fontFamilySvg} />
							<Input
								fontSize={22}
								value={searchFamily}
								onTextEditEnd={(e) => setSearchFamily(e.characters)}
								placeholder="Find family"
							/>
						</AutoLayout>
						<AutoLayout
							padding={16}
							fill={"#eee"}
							cornerRadius={8}
							spacing={12}
							verticalAlignItems={"end"}
							stroke={"#ccc"}
							strokeWidth={1}
							width={"fill-parent"}
						>
							<SVG src={fontStyleSvg} />
							<Input
								fontSize={22}
								value={searchStyle}
								onTextEditEnd={(e) => setSearchStyle(e.characters)}
								placeholder="Find style"
							/>
						</AutoLayout>
						<AutoLayout
							padding={16}
							fill={"#eee"}
							cornerRadius={8}
							spacing={12}
							verticalAlignItems={"end"}
							stroke={"#ccc"}
							strokeWidth={1}
							width={"fill-parent"}
						>
							<SVG src={fontSizeSvg} />
							<Input
								fontSize={22}
								value={searchFontSize}
								onTextEditEnd={(e) => setSearchFontSize(e.characters)}
								placeholder="Find font size"
							/>
						</AutoLayout>
					</AutoLayout>
					<AutoLayout
						hoverStyle={{ fill: "#1A7CF0" }}
						onClick={() => handleSearch()}
						width={"fill-parent"}
						padding={{ top: 14, bottom: 14, right: 24, left: 24 }}
						verticalAlignItems={"center"}
						horizontalAlignItems={"center"}
						// height={"fill-parent"}
						cornerRadius={12}
						fill={"#0B68D6"}
					>
						<Text fontSize={24} fill={"#fff"}>
							Search
						</Text>
					</AutoLayout>
				</AutoLayout>
			)}
			{stylesChecked?.length !== 0 && (
				<Fragment>
					<AutoLayout width={"fill-parent"} verticalAlignItems={"center"} spacing={24} padding={{ top: 12 }}>
						<Text fontSize={24}>Change all selected styles</Text>
						<Rectangle width={"fill-parent"} height={1} fill={"#ccc"} />
					</AutoLayout>
					<AutoLayout direction={"vertical"} width={"fill-parent"} spacing={12}>
						<AutoLayout spacing={24} verticalAlignItems={"center"} width={"fill-parent"} overflow={"scroll"}>
							<AutoLayout
								padding={16}
								fill={"#eee"}
								cornerRadius={8}
								width={"fill-parent"}
								spacing={12}
								verticalAlignItems={"end"}
								stroke={"#ccc"}
								strokeWidth={1}
							>
								<SVG src={folderSvg} />
								<Input
									width={"fill-parent"}
									fontSize={22}
									value={checkedGroup}
									onTextEditEnd={(e) => setCheckedGroup(e.characters)}
									placeholder="Move to group"
								/>
							</AutoLayout>

							<AutoLayout
								padding={16}
								fill={"#eee"}
								cornerRadius={8}
								width={"fill-parent"}
								spacing={12}
								verticalAlignItems={"end"}
								stroke={"#ccc"}
								strokeWidth={1}
							>
								<SVG src={fontFamilySvg} />
								<Input
									width={"fill-parent"}
									fontSize={22}
									value={checkedFamily}
									onTextEditEnd={(e) => setCheckedFamily(e.characters)}
									placeholder="Change to font family"
								/>
							</AutoLayout>
							<AutoLayout
								padding={16}
								fill={"#eee"}
								cornerRadius={8}
								width={"fill-parent"}
								spacing={12}
								verticalAlignItems={"end"}
								stroke={"#ccc"}
								strokeWidth={1}
								overflow={"scroll"}
							>
								<SVG src={fontStyleSvg} />
								<Input
									width={"fill-parent"}
									fontSize={22}
									value={checkedStyle}
									onTextEditEnd={(e) => setCheckedStyle(e.characters)}
									placeholder="Change to font style"
								/>
							</AutoLayout>
							<AutoLayout
								padding={16}
								fill={"#eee"}
								cornerRadius={8}
								width={"fill-parent"}
								spacing={12}
								verticalAlignItems={"end"}
								stroke={"#ccc"}
								strokeWidth={1}
							>
								<SVG src={fontSizeSvg} />
								<Input
									width={"fill-parent"}
									fontSize={22}
									value={checkedFontSize}
									onTextEditEnd={(e) => setCheckedFontSize(e.characters)}
									placeholder="Change to font size"
								/>
							</AutoLayout>
							<AutoLayout
								onClick={() => handleChangeSelectedStyle()}
								padding={{ top: 14, bottom: 14, right: 24, left: 24 }}
								verticalAlignItems={"center"}
								horizontalAlignItems={"center"}
								// height={"fill-parent"}
								cornerRadius={12}
								fill={"#0B68D6"}
							>
								<Text fontSize={24} fill={"#fff"}>
									Change selected
								</Text>
							</AutoLayout>
						</AutoLayout>
						<Text fill={"#F23131"}>
							Warning: If you change the font family, you should check the name of font style.
						</Text>
					</AutoLayout>
				</Fragment>
			)}
			<AutoLayout direction={"vertical"} width={"fill-parent"}>
				<AutoLayout
					verticalAlignItems={"center"}
					spacing={12}
					width={"fill-parent"}
					fill={"#333"}
					cornerRadius={{ topLeft: 16, topRight: 16 }}
					padding={{ left: 12, right: 12 }}
				>
					<CheckBox isCheck={hasCheckAll} onClick={() => handleCheckAll()} />
					<Rectangle width={1} height={60} fill={"#ccc"} />
					<Text fontSize={24} fontFamily={"Roboto"} width={450} fill={"#eee"}>
						Name
					</Text>
					<Rectangle width={1} height={60} fill={"#ccc"} />
					<Text fontSize={24} fontFamily={"Roboto"} width={"fill-parent"} fill={"#eee"}>
						Font family
					</Text>
					<Rectangle width={1} height={60} fill={"#ccc"} />
					<Text fontSize={24} fontFamily={"Roboto"} width={"fill-parent"} fill={"#eee"}>
						Style
					</Text>
					<Rectangle width={1} height={60} fill={"#ccc"} />
					<Text fontSize={24} fontFamily={"Roboto"} width={"fill-parent"} fill={"#eee"}>
						Size
					</Text>
					<Rectangle width={1} height={60} fill={"#ccc"} />
					<Text fontSize={24} fontFamily={"Roboto"} width={"fill-parent"} fill={"#eee"}>
						Description
					</Text>
				</AutoLayout>
				<AutoLayout direction={"vertical"} spacing={0} width={"fill-parent"}>
					{filterStyles.length !== 0 && cacheStyle.length !== 0 && cacheStyle.length === filterStyles.length ? (
						filterStyles.map((style) => {
							// console.log(style)
							const cache = cacheStyle.find((i) => i.id === style.id);
							const check = checkFontName(cache);
							// console.log(check);
							return (
								<AutoLayout key={style.id} width={"fill-parent"} direction={"vertical"}>
									<AutoLayout
										verticalAlignItems={"center"}
										spacing={12}
										width={"fill-parent"}
										padding={{ left: 12, right: 12 }}
									>
										<CheckBox
											isCheck={stylesChecked.find((id) => id === style.id) ? true : false}
											onClick={() => handleCheck(style.id)}
										/>
										<Rectangle width={1} height={50} fill={"#ccc"} />
										<Input
											value={cache.name}
											onTextEditEnd={(e) => {
												setCacheStyle((prev) =>
													prev.map((i) => (i.id === style.id ? { ...i, name: e.characters } : i))
												);
											}}
											placeholder="Type name"
											fontSize={22}
											fontFamily={"Roboto"}
											width={450}
										/>
										<Rectangle width={1} height={50} fill={"#ccc"} />
										<AutoLayout width={"fill-parent"} verticalAlignItems={"center"} spacing={6}>
											{!check.check && check.status === "family" && <SVG src={warningSvg} />}
											<Input
												value={cache.fontName.family}
												onTextEditEnd={(e) => {
													setCacheStyle((prev) =>
														prev.map((i) =>
															i.id === style.id
																? { ...i, fontName: { ...i.fontName, family: e.characters } }
																: i
														)
													);
												}}
												fontSize={22}
												fontFamily={"Roboto"}
												width={"fill-parent"}
											/>
										</AutoLayout>
										<Rectangle width={1} height={50} fill={"#ccc"} />
										<AutoLayout width={"fill-parent"} verticalAlignItems={"center"} spacing={6}>
											{!check.check && <SVG src={warningSvg} />}
											<Input
												value={cache.fontName.style}
												onTextEditEnd={(e) => {
													setCacheStyle((prev) =>
														prev.map((i) =>
															i.id === style.id
																? { ...i, fontName: { ...i.fontName, style: e.characters } }
																: i
														)
													);
												}}
												fontSize={22}
												fontFamily={"Roboto"}
												width={"fill-parent"}
											/>
										</AutoLayout>
										<Rectangle width={1} height={50} fill={"#ccc"} />
										<Input
											value={cache.fontSize.toString()}
											onTextEditEnd={(e) => {
												setCacheStyle((prev) =>
													prev.map((i) =>
														i.id === style.id ? { ...i, fontSize: Number(e.characters) } : i
													)
												);
											}}
											placeholder="Type size"
											fontSize={22}
											fontFamily={"Roboto"}
											width={"fill-parent"}
										/>
										<Rectangle width={1} height={50} fill={"#ccc"} />
										<Input
											value={cache.description}
											onTextEditEnd={(e) => {
												setCacheStyle((prev) =>
													prev.map((i) => (i.id === style.id ? { ...i, description: e.characters } : i))
												);
											}}
											placeholder="Type description"
											fontSize={22}
											fontFamily={"Roboto"}
											width={"fill-parent"}
										/>
									</AutoLayout>
									<Rectangle width={"fill-parent"} height={1} fill={"#ccc"} />
								</AutoLayout>
							);
						})
					) : (
						<Text
							fontSize={20}
							width={"fill-parent"}
							height={40}
							horizontalAlignText={"center"}
							verticalAlignText={"center"}
						>
							No style
						</Text>
					)}
				</AutoLayout>
			</AutoLayout>
			<AutoLayout spacing={"auto"} width={"fill-parent"}>
				<AutoLayout
					padding={24}
					fill={"#333"}
					cornerRadius={12}
					onClick={() => getLocalTextStyle()}
					spacing={16}
					hoverStyle={{ fill: "#4A4A4A" }}
				>
					<SVG src={loadSvg} />
					<Text fontSize={26} fill={"#fff"} horizontalAlignText={"center"}>
						{textStyles.length === 0 ? "Load local text styles" : "Reload local text styles"}
					</Text>
				</AutoLayout>

				<AutoLayout
					padding={24}
					fill={"#0B68D6"}
					cornerRadius={12}
					onClick={() => updateStyle()}
					spacing={16}
					hoverStyle={{ fill: "#1A7CF0" }}
				>
					<SVG src={uploadSvg} />
					<Text fontSize={26} fill={"#fff"} horizontalAlignText={"center"}>
						Update styles
					</Text>
				</AutoLayout>
			</AutoLayout>
		</AutoLayout>
	);
}

widget.register(Widget);
