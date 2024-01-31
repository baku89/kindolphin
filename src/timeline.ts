export type Keyframe<T> = [frame: number, value: T]

export const FPS = 50

export const scrollTrack: Keyframe<number>[] = [
	[0, 444],
	[105, 875.036],
	[164, 1117.34],
	[242, 1430.7],
	[343, 1844.73],
	[432, 2187],
	[604, 2887.69],
	[812, 3743.86],
	[1040, 4691.97],
	[1193, 5294.02],
	[1379, 6037],
	[1524, 6632.08],
	[1679, 7249.58],
	[1866, 7940.49],
	[1980, 8408.18],
	[2078, 8795.35],
	[2168, 9167.62],
	[2327, 9805.93],
	[2471, 10398.7],
	[2636, 11063],
	[2773, 11626.7],
	[2974, 12446.4],
	[3117, 13027],
	[3309, 13799.6],
	[3599, 14996.3],
	[3719, 15495.9],
	[3874, 16139],
	[4097, 17054.6],
	[4200, 17475.6],
	[4366, 18159.2],
	[4530, 18819.1],
	[4817, 19996],
	[4998, 20736.3],
	[5155, 21365.2],
	[5319, 22043.4],
	[5512, 22854.6],
	[5749, 23822.8],
	[5947, 24637.2],
	[6176, 25567.2],
	[6454, 26707.3],
	[6826, 28213],
	[7138, 29498],
	[7248, 29956],
	[7533, 31169.9],
	[7622, 31565.8],
	[7792, 32295.9],
	[7904, 32773.4],
	[8018, 33314],
]
// 48 keyframes

function createLookup(xIndex: number, yIndex: number) {
	return (x: number, track: Keyframe<number>[]) => {
		let left = 0
		let right = track.length - 1

		if (x <= track[0][xIndex]) {
			// If the frame is before the first keyframe, extrapolate from the first two keyframes
			left = 1
		} else if (x >= track[track.length - 1][xIndex]) {
			// If the frame is after the last keyframe, return the last keyframe
			left = track.length - 1
		} else {
			// Search the first keyframe that is greater than the frame by binary search
			while (left < right) {
				const mid = Math.floor((left + right) / 2)
				if (track[mid][xIndex] <= x) {
					left = mid + 1
				} else {
					right = mid
				}
			}
		}

		// Interpolate between the two keyframes
		const key1 = track[left - 1]
		const key2 = track[left]
		const ratio = (x - key1[xIndex]) / (key2[xIndex] - key1[xIndex])

		return key1[yIndex] + (key2[yIndex] - key1[yIndex]) * ratio
	}
}

export const lookupValue = createLookup(0, 1) as (
	time: number,
	track: Keyframe<number>[]
) => number

export const lookupTime = createLookup(1, 0) as (
	value: number,
	track: Keyframe<number>[]
) => number
