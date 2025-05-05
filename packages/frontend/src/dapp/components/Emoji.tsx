import { FC } from 'react'
import { numToAnimalEmoji } from '~~/dapp/helpers/misc'
// Import the extracted type
import type { AnimalEmojiProps } from '~~/types/components.types';

// Animal emojis are represented by the range [1F400-1F43F] https://apps.timwhitlock.info/unicode/inspect/hex/1F400-1F43F
// The corresponding demo Move package chooses a number from the range [1,64] randomly,
// and we convert it to the corresponding animal emoji.

// Remove original IProps definition
// interface IProps {
//   index: number
// }

// Use the imported and renamed AnimalEmojiProps type
const AnimalEmoji: FC<AnimalEmojiProps> = ({ index }) => {
  // If a wrong index given for some reason, we render nothing.
  if (index < 1 || index > 64) {
    console.error('A wrong emoji index given', index)
    return <></>
  }
  return <>{numToAnimalEmoji(index)}</>
}

export default AnimalEmoji
