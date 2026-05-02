import Long from 'long'

export function longToBigInt(value: Long): bigint {
	return (BigInt(value.high) << 32n) | BigInt(value.low)
}

export function bigIntToLong(value: bigint, signed?: boolean): Long {
	return new Long(Number(value & 0x00000000ffffffffn), Number((value & 0xffffffff00000000n) >> 32n), !(signed ?? true))
}
