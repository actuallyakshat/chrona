# Chrona

Chrona is a mobile application that redefines social interaction by introducing a time-based message delivery system. In a world of instant gratification, Chrona encourages more thoughtful, meaningful, and patient communication by making you wait for your messages to be delivered, just like sending a letter.

## Features

- **Time-Delayed Messaging**: The core of Chrona. Messages (or "Chronicles") take a realistic amount of time to be delivered based on the distance between you and your friend.
- **Meaningful Connections**: Build genuine connections with people where conversations are deliberate and cherished.
- **User Profiles**: Create a unique profile with your bio, interests, location, and more.
- **Recommendation Engine**: Discover and connect with new people based on your preferences for age, gender, location, and shared interests.
- **Onboarding**: A smooth and guided setup process to get you started on your Chrona journey.

## Tech Stack

- **Frontend**: React Native, Expo, NativeWind
- **Backend & Database**: Convex
- **Authentication**: Clerk

## Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.x or later recommended)
- [pnpm](https://pnpm.io/installation)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd chrona
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```
3.  **Set up your environment variables:**
    Create a `.env` file in the root of the project and add the necessary configuration for Convex and Clerk.

### Running the App

- To start the development server and get a QR code to run the app on your device using Expo Go:
  ```bash
  pnpm start
  ```
- To run the app on an Android emulator or connected device:
  ```bash
  pnpm android
  ```
- To run the app on an iOS simulator or connected device:
  ```bash
  pnpm ios
  ```

## Future Features

I am constantly working to improve Chrona. Here are some features I plan to introduce in the future:

- **Stripe Integration**: I will be adding premium features that can be unlocked through in-app purchases.
- **More to come**: I have a lot of exciting features planned!

## Deployment

Chrona will be available on the Expo app store soon. Stay tuned for the official release!
