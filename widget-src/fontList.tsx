const { widget } = figma;
const { AutoLayout, Text, useSyncedState, Input, SVG } = widget;

const fontFamilySvg = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" width="24" height="24" x="0" y="0" viewBox="0 0 511.948 511.948" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M370.203 438.175 229.05 73.066a17.503 17.503 0 0 0-16.419-11.299h-54.554a17.654 17.654 0 0 0-16.419 11.299L.592 438.175a8.828 8.828 0 0 0 8.21 12.006h55.702a8.932 8.932 0 0 0 8.298-5.65l29.396-76.977a8.827 8.827 0 0 1 8.21-5.65H260.3a8.932 8.932 0 0 1 8.298 5.65l29.396 76.977a8.827 8.827 0 0 0 8.21 5.65h55.702a8.887 8.887 0 0 0 8.297-12.006zM232.228 300.112h-93.749a9.251 9.251 0 0 1-8.651-12.623l46.874-122.615a9.226 9.226 0 0 1 17.302 0l46.963 122.615a9.341 9.341 0 0 1-8.739 12.623zM511.356 438.175l-71.592-188.469a17.655 17.655 0 0 0-16.508-11.388h-25.6a17.656 17.656 0 0 0-16.508 11.388l-32.132 84.568 21.363 55.437a8.219 8.219 0 0 1 4.59-1.324h70.974a8.83 8.83 0 0 1 8.21 5.561l20.303 50.67a8.827 8.827 0 0 0 8.21 5.561h20.48a8.828 8.828 0 0 0 8.21-12.004zm-79.713-85.098h-42.284a4.46 4.46 0 0 1-4.149-6.18l21.098-52.789a4.414 4.414 0 0 1 8.298 0l21.186 52.789a4.491 4.491 0 0 1-.435 4.191 4.49 4.49 0 0 1-3.714 1.989z" fill="#555555" data-original="#000000"></path></g></svg>`;

const FontList = ({ find, fontsData }: { find?: any; fontsData: any[] }) => {
	const [findText, setFindText] = useSyncedState("findText", "");

	const [result, setResult] = useSyncedState<any[]>("result", []);

	const findByText = (text: string) => {
		// console.log(fontsData);
		if (text !== "") {
			const regex = new RegExp(text, "i");
			const res = fontsData.filter((font) => regex.test(font.family));
			setResult(res);
		} else {
			setResult([]);
		}

		// console.log(res);
	};

	return (
		<AutoLayout width={"fill-parent"} direction={"vertical"}>
			<AutoLayout
				width={"fill-parent"}
				padding={16}
				fill={"#eee"}
				cornerRadius={8}
				spacing={12}
				verticalAlignItems={"end"}
				stroke={"#ccc"}
				strokeWidth={1}
			>
				<SVG src={fontFamilySvg} />
				<Input
					width={"fill-parent"}
					fontSize={20}
					value={findText}
					onTextEditEnd={(e) => {
						setFindText(e.characters);
						findByText(e.characters);
					}}
					placeholder="Search local fonts"
				/>
			</AutoLayout>
			<AutoLayout direction={"vertical"} padding={{top: 24}}>
				{result.length !== 0 && (
					<>
						<Text>font List</Text>
						{result.map((i, index) => (
							<Text key={index}>
								{i.family} | {i.style}
							</Text>
						))}
					</>
				)}
			</AutoLayout>
		</AutoLayout>
	);
};
export default FontList;
