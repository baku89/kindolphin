// Add csv type definition

module '*?raw' {
	const content: string
	export default content
}

module '*?url' {
	const url: string
	export default url
}

// Prototype: the package ships no type declarations.
declare module '@arikata-nobuaki/time-pitch-player' {
	export class TimePitchPlayer {
		duration: number
		sampleRate: number
		playing: boolean
		playbackRate: number
		pitch: number
		pitchFollowsSpeed: boolean
		currentTime: number
		volume: number
		loop: boolean
		onposition:
			| ((p: {seconds: number; duration: number; playing: boolean}) => void)
			| null
		onended: (() => void) | null
		onerror: ((message: string) => void) | null
		loadUrl(url: string, label: string): Promise<void>
		loadFile(file: File): Promise<void>
		play(): Promise<void>
		pause(): void
		stop(): void
	}
}
