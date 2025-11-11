# Snap OS Location Tools

<img width="637" height="474" alt="1 HandUI FloatUI without Mobile Kit" src="https://github.com/user-attachments/assets/3188cddd-06eb-492a-9c48-cd87f31fca42" />

## What is Snap OS Location Tools?

See it in action on YouTube at https://www.youtube.com/watch?v=AGLMP8GyEv4 for a quick first impression.

A Lens Studio project for Snap Spectacles + Snap OS, intended for developers that need to work with GPS location and compass heading data on Spectacles '24.

It makes the location & heading data visible both in text and visualised in a map and compass, so you can easily see what Spectacles thinks its location & heading are while you are developing.

There's a hand-locked menu for quick access to the essential data, and a detailed popup menu which shows the full data.

In addition, it implements Mobile Kit and offers a companion [Mobile Kit iOS Xcode project](https://github.com/siekermantechnology/SnapOSLocationToolsiOS) which allows you to pull in location data from your (iOS) mobile device. In my experience, when testing indoors during development Spectacles '24 is limited in location accuracy, so this allows you to use a more accurate location faster while you're developing and testing a Lens. Outdoors I've had mixed results, but there it has been better if you've got good GPS signal.

## Screenshots

The hand-locked UI showing a GPS-based location.

<img width="637" height="667" alt="2 HandUI with GPS" src="https://github.com/user-attachments/assets/71a585d4-565a-485f-a1b3-1d582206df46" />

The floating details UI with a connected iOS device sending Mobile Kit location data from the phone.

<img width="637" height="474" alt="3 Mobile Kit with phone" src="https://github.com/user-attachments/assets/ddb4dd0e-9727-420c-b226-eb8f7bea5650" />

The hand-locked UI and floating details UI combined.

<img width="637" height="476" alt="4 HandUI FloatUI with Mobile Kit" src="https://github.com/user-attachments/assets/eae89d3d-2240-4df5-bad5-55e76f96e084" />

The location permission alert.

<img width="412" height="526" alt="5 Permission alert" src="https://github.com/user-attachments/assets/0d35286b-2e7d-4dbf-a3ae-d766eee090e0" />

The project running in the Lens Studio editor.

<img width="412" height="496" alt="Screenshot of the project running in the Lens Studio editor" src="https://github.com/user-attachments/assets/738efd36-0886-4428-96d4-1c8d72219242" />

## But why?

In essence, because I needed it myself. I've been [working on](https://www.youtube.com/watch?v=85uvuu_vJDA) showing city data in augmented reality on Spectacles, and ran into the limitations of the current hardware, so had to develop this tooling for my own testing. It made sense to share it, as it might be useful for others.

Some thoughts on how it might be useful:
- The primary use will probably be as-is, as a complete tool to help out while working with location & heading on device. Feel free though to scrap it for parts, integrate it into your own projects completely or partially.
- As a learning example of how to use several of the components it incorporates (e.g. Location data, Map Component, Mobile Kit). See the complete list below of elements from the SDK and [Spectacles Samples](https://github.com/Snapchat/Spectacles-Sample) that are being used.
- It is not intended as an example of the highest quality of Lens Studio coding. An experienced Lens Studio + TypeScript developer will undoubtedly find many things that can be improved. Still, I hope it serves its purpose.

## How does it work?

On Spectacles:
- Open the project in Lens Studio and deploy to Spectacles.
- Look at the inside of your left hand to show the hand-locked UI with essential data.
- Click the Details button to open the floating UI with detailed data.
- Click the Start Mobile Kit button to start listening for data from the Mobile Kit iOS app. When you start broadcasting data from the iOS app, the Lens will start displaying it and show a second, smaller user pin in the map representing the Mobile Kit location.

The Lens also works in the Lens Studio editor, with a few limitations and notes:
- In the editor, the hand-locked UI is spawned in the middle of the screen, because hands are not available in the editor.
- When running in the editor, Lens Studio mocks the location as a point in the middle of London. This is an expected Lens Studio behaviour.
- Mobile Kit doesn't work in Lens Studio editor, only on Spectacles.

## Standing on the shoulders of giants

This project uses, remixes and combines several Spectacles features and code from several of the samples. It glues those building blocks together with new UI, visualisations and logic, into a comprehensive tool.

The Lens Studio / Spectacles features that are used in the project:
- [Location](https://developers.snap.com/spectacles/about-spectacles-features/apis/location)
- [Map Component](https://developers.snap.com/lens-studio/features/location-ar/map-component)
- [Spectacles UI Kit](https://developers.snap.com/spectacles/spectacles-frameworks/spectacles-ui-kit/get-started)
- [Spectacles Interaction Kit](https://developers.snap.com/spectacles/spectacles-frameworks/spectacles-interaction-kit/get-started)
- [Spectacles Mobile Kit](https://developers.snap.com/spectacles/spectacles-frameworks/spectacles-mobile-kit/getting-started)
- [Transparent Permission Alerts](https://developers.snap.com/spectacles/permission-privacy/overview#transparent-permission)

Various [Spectacles samples](https://github.com/Snapchat/Spectacles-Sample) have been used either directly with some modifications, or as basic inspiration but more heavily rearranged:
- [Outdoor Navigation](https://github.com/Snapchat/Spectacles-Sample/tree/main/Outdoor%20Navigation) for the TypeScript implementation of Map Component. This has been used pretty much without changes.
- [Navigation Kit](https://github.com/Snapchat/Spectacles-Sample/tree/main/Navigation%20Kit) for location data.
- [AI Music Gen](https://github.com/Snapchat/Spectacles-Sample/blob/main/AI%20Music%20Gen/Assets/Scripts/HandDockedMenu.ts) for HandLockedUI.
- [Spectacles Mobile Kit](https://github.com/Snapchat/Spectacles-Sample/tree/main/Spectacles%20Mobile%20Kit) for Mobile Kit.

## Lens Studio project structure

Below are some notes on the major parts of the project structure in the Assets folder and the Scene Hierarchy. Each of the scripts in the project also has quite some documentation and comments, which should help with finding your way.

### HandLockedUI

- Quick menu attached to inside of the left hand for quick reference, just to give a quick at a glance idea of location data status.
- Shows which location source / quality is active
- Horizontal accuracy of the location
- Heading text and quick visualisation of heading (arrow points north when you hold your hand flat)
  - Note that in my experience heading has often been quite inaccurate on Spectacles, so if it's pointing the wrong way, that's because Spectacles hasn't figured out where north is properly. I've seen notes that walking around outside for a bit should correct this.

### FloatingDetailsUI

- Full location data in text.
- Visualisation on map of location and heading.
- Starting Mobile Kit session and showing Mobile Kit location data. Also shows the Mobile Kit location on the map with a smaller user visualisation. See below for further details on Mobile Kit.

### UIPresentationManagers vs UIContentManagers

- I've tried to separate everything to do with showing/hiding the UI in the right place versus handling the content that is shown inside it. UIPresentationManagers for the former, UIContentManagers for the latter.

### LocationManager

- Implementation of the various location and heading APIs in the Lens Scripting API.
- This keeps track of the last known location information from the Spectacles.

### MobileKitManager

- Connection with Mobile Kit iOS sample app for location from smartphone which tends to be much more accurate, much faster.
- Helpful if you need accurate location on Spectacles and don't want to wait a few minutes for the FUSED location type to become active.
- This keeps track of the last known location information from the iOS Mobile Kit app.

### MapManager

- Simply holds the out-of-the-box Map Component script, from one of the existing Spectacles samples.

### Mobile Kit

A few notes on Mobile Kit specifically:
- See the related [SnapOSLocationToolsiOS](https://github.com/siekermantechnology/SnapOSLocationToolsiOS) repository which contains the Xcode project for iOS with the Mobile Kit and location information integration.
- To use the iOS app, open the Xcode project (SnapOSLocationToolsiOS/app/iOS/SpectaclesKitSample/SpectaclesKitSample.xcodeproj), build and deploy it to an iOS device, grant the location and bluetooth permissions, then use the Mobile Kit bind functionality to pair the iOS app and the Spectacles Lens. Once bound, first 'Start Mobile Kit' in the Lens, then in the iOS app start a Mobile Kit session, then start sending subscription messages. This will send the latest location information from the iOS device to the Lens once per second.
- With the current version of Mobile Kit, I've had trouble with closing the connection, both from the Lens side and from the iOS side, so mine is a very rough implementation, which only starts the connection and just keeps it open until you force close the Lens and iOS app. This is definitely open for future improvement.
- For smartphones, I've only made the iOS implementation based on the iOS sample app in the relevant Spectacles samples repository. Adding the Android version is another potential future improvement.
- The iOS app is heavily AI-coded, because my Swift skills are very rusty. It's in ok shape, but I've really focused on just making it work, not how clean everything is.

## Technical information

- Lens Studio v5.15.1.
- Snap OS v5.64 (more widely known as Snap OS v2.0) on Spectacles '24.
- Mobile Kit iOS app built using macOS v26.1, iOS v26.1 and Xcode v26.1.
- I use Cursor and Anthropic's Claude Sonnet 4.5 for AI-assisted coding, so parts of the code were generated. I tend to take a granular approach, keeping tight control on what it produces.

## License

- The project uses the [MIT License](./LICENSE), but obviously relies heavily on the Spectacles samples, so respect whatever license is applicable to those.

## Tip of the hat

Many thanks to the useful information found in:
- The [videos](https://www.youtube.com/@1fficialAR) by Alessio Grancini on developing for Spectacles!
- The [blog articles](https://localjoost.github.io/) by Joost van Schaik on developing for Spectacles!
- The Snap team for building Spectacles and Snap OS!

## Release notes

### v1.0

- Initial release (Snap OS v5.64, Lens Studio v5.15.1)
- Limited Mobile Kit implementation, only starting the connection, not closing it.

## Contact

- If you have questions, feedback, etc, reach out to me on LinkedIn (https://www.linkedin.com/in/pietersiekerman/) and be sure to check out my monthly XR Developer News newsletter (https://www.xrdevelopernews.com/).
