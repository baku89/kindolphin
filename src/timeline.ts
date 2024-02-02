export type Keyframe<T> = [frame: number, value: T]

export const FPS = 50

export const scrollTrack: Keyframe<number>[] = [
	[0, 435.1],
	[123, 913.821],
	[187, 1147.6],
	[287, 1535.15],
	[364, 1875.26],
	[432, 2178.1],
	[538, 2602.24],
	[613, 2925.33],
	[812, 3734.96],
	[1040, 4654.5],
	[1193, 5285.12],
	[1379, 6028.1],
	[1524, 6623.18],
	[1679, 7240.68],
	[1866, 7931.59],
	[1980, 8399.28],
	[2078, 8786.45],
	[2168, 9158.72],
	[2327, 9797.03],
	[2471, 10389.8],
	[2636, 11054.1],
	[2773, 11617.8],
	[2974, 12437.5],
	[3117, 13018.1],
	[3309, 13790.7],
	[3599, 14987.4],
	[3719, 15487],
	[3874, 16130.1],
	[4097, 17045.7],
	[4200, 17466.7],
	[4366, 18150.3],
	[4530, 18810.2],
	[4817, 19987.1],
	[4998, 20727.4],
	[5155, 21356.3],
	[5319, 22034.5],
	[5512, 22845.7],
	[5749, 23813.9],
	[5947, 24628.3],
	[6176, 25558.3],
	[6454, 26698.4],
	[6826, 28204.1],
	[7138, 29489.1],
	[7248, 29947.1],
	[7533, 31161],
	[7622, 31556.9],
	[7792, 32287],
	[7904, 32764.5],
	[8018, 33305.1],
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
