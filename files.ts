import fs from 'node:fs/promises'
import path from 'node:path'

export const loadFiles = async (dir) =>
	(
		await Promise.all(
			(
				await fs.readdir(dir, { withFileTypes: true })
			).map((file) => {
				const res = path.resolve(dir, file.name)
				return file.isDirectory() ? loadFiles(res) : res
			}),
		)
	).flat()
