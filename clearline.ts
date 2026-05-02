export function clearLine(line: string) {
	if (process.argv.includes('--launcher-cursor-control')) {
		Lilith.msg(`${line}{*lilith_redraw_line*}`)
		return
	}
	if (process.stdout.clearLine) {
		process.stdout.clearLine(0)
		process.stdout.cursorTo(0)
	}
	Lilith.msg(line)
}
