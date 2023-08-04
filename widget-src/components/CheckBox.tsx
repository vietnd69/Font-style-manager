const { widget } = figma;
const { AutoLayout, SVG } = widget;

const checkSvg = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" width="14" height="14" x="0" y="0" viewBox="0 0 417.813 417" style="enable-background:new 0 0 512 512" xml:space="preserve"><g><path d="M159.988 318.582c-3.988 4.012-9.43 6.25-15.082 6.25s-11.094-2.238-15.082-6.25L9.375 198.113c-12.5-12.5-12.5-32.77 0-45.246l15.082-15.086c12.504-12.5 32.75-12.5 45.25 0l75.2 75.203L348.104 9.781c12.504-12.5 32.77-12.5 45.25 0l15.082 15.086c12.5 12.5 12.5 32.766 0 45.246zm0 0" fill="#ffffff" data-original="#ffffff"></path></g></svg>`;

const CheckBox = ({ isCheck, onClick }: { isCheck: Boolean; onClick?: () => void }) => {
	return (
		<AutoLayout width={"hug-contents"} height={"hug-contents"} verticalAlignItems={"center"} horizontalAlignItems={"center"} padding={8}>
			<AutoLayout
				width={24}
				height={24}
				fill={isCheck ? "#117BDD" : "#eee"}
				verticalAlignItems={"center"}
				horizontalAlignItems={"center"}
				padding={{ top: 2 }}
				onClick={() => onClick && onClick()}
				cornerRadius={8}
				strokeWidth={isCheck ? 0 : 1}
				stroke={"#999"}
				hoverStyle={{fill: "#D1D1D1"}}
			>
				{isCheck && <SVG src={checkSvg} />}
			</AutoLayout>
		</AutoLayout>
	);
};
export default CheckBox;
