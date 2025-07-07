/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#f3f4f6',
      },
      fontFamily: {
        playfair: ['PlayfairDisplay_400Regular'],
        'playfair-italic': ['PlayfairDisplay_400Regular_Italic'],
        'playfair-medium': ['PlayfairDisplay_500Medium'],
        'playfair-medium-italic': ['PlayfairDisplay_500Medium_Italic'],
        'playfair-semibold': ['PlayfairDisplay_600SemiBold'],
        'playfair-semibold-italic': ['PlayfairDisplay_600SemiBold_Italic'],
        'playfair-bold': ['PlayfairDisplay_700Bold'],
        'playfair-bold-italic': ['PlayfairDisplay_700Bold_Italic'],
        'playfair-extrabold': ['PlayfairDisplay_800ExtraBold'],
        'playfair-extrabold-italic': ['PlayfairDisplay_800ExtraBold_Italic'],
        'playfair-black': ['PlayfairDisplay_900Black'],
        'playfair-black-italic': ['PlayfairDisplay_900Black_Italic'],
        inter: ['Inter_400Regular'],
        'inter-thin': ['Inter_100Thin'],
        'inter-extralight': ['Inter_200ExtraLight'],
        'inter-light': ['Inter_300Light'],
        'inter-italic': ['Inter_400Regular_Italic'],
        'inter-medium': ['Inter_500Medium'],
        'inter-medium-italic': ['Inter_500Medium_Italic'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
        'inter-extrabold': ['Inter_800ExtraBold'],
        'inter-black': ['Inter_900Black'],
      },
    },
  },
  plugins: [],
};
