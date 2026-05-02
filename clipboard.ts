import { type ChildProcessWithoutNullStreams, spawn } from 'node:child_process'

export function copyToClipboard(text: string): string {
	let spawned: ChildProcessWithoutNullStreams
	try {
		switch (process.platform) {
			case 'win32':
				spawned = spawn('clip')
				break
			case 'darwin':
				spawned = spawn('pbcopy')
				break
			case 'linux':
				spawned = spawn('xclip', ['-selection', 'clipboard'])
				break
			default:
				return 'unsupported platform'
		}
	} catch {
		return 'error spawning'
	}
	spawned.on('error', (e: NodeJS.ErrnoException) => {
		if (e.code === 'ENOENT') {
			if (process.platform === 'linux') {
				return 'xclip not installed'
			}
			return 'failed to launch clipboard utility'
		}
		return 'failed to launch clipboard utility'
	})
	try {
		spawned.stdin.end(text)
	} catch {
		return 'failed to write to clipboard'
	}

	return 'success'
}
