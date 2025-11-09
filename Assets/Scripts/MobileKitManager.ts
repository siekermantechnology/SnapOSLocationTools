/**
 * MobileKitManager - Manages Mobile Kit session and GPS location data from the mobile app
 * 
 * NOTE: Check the readme of the project for important notes about Mobile Kit. Lots of relevant information there.
 * 
 * This component establishes a connection to the Spectacles Mobile Kit module on the mobile device and subscribes
 * to GPS location updates from the paired mobile device. It receives real-time location data
 * including latitude, longitude, horizontal accuracy, altitude, and vertical accuracy, then
 * stores this data and notifies content managers when new location information is available.
 * The component handles session lifecycle management, connection callbacks, and JSON parsing
 * of location data received from the mobile app.
 * 
 * Key Features:
 * - Mobile kit session management with connection/disconnection callbacks
 * - GPS location subscription from paired mobile device
 * - Real-time location data parsing and storage
 * - Automatic UI updates when new location data is received
 * - Editor compatibility with appropriate fallback behavior
 */

import { FloatingDetailsUIContentManager } from "./FloatingDetailsUIContentManager";

@component
export class MobileKitManager extends BaseScriptComponent {

  /** Reference to FloatingDetailsUIContentManager component */
  @input
  floatingDetailsUIContentManager!: FloatingDetailsUIContentManager

  /** Properties to store the user's location data */
  latitude: number = 0;               // Latitude in degrees
  longitude: number = 0;              // Longitude in degrees
  horizontalAccuracy: number = 0;     // Accuracy of lat/long in meters
  altitude: number = 0;               // Altitude in meters
  verticalAccuracy: number = 0;       // Accuracy of altitude in meters
  
  private module = require("LensStudio:SpectaclesMobileKitModule");

  private session: any = null;

  async onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      this.onStart();
    });
  }

  async onStart() {
    if (global.deviceInfoSystem.isEditor()) {
      print("onStart() - Mobile Kit is not available in the Lens Studio editor");
      return;
    }

    print("onStart() - Mobile Kit starting on Spectacles");
    await this.startSession();
  }

  /**
   * Starts the Mobile Kit session and subscribes to GPS location updates.
   * @returns A promise that resolves when the session is connected and the GPS location subscription is started.
   */
  private async startSession(): Promise<void> {
    try {
      print("startSession() - Awaiting session connection");

      this.session = await new Promise((resolve, reject) => {
        const session = this.module.createSession();
        session.onDisconnected.add(() => {
          print("startSession() - session.onDisconnected callback triggered");
        });
        session.onConnected.add(() => {
          print("startSession() - session.onConnected callback triggered");
          resolve(session);
        });
        session.start();
      });

      const session = this.session;
      print("startSession() - Session connected");

      this.startGPSLocationSubscription(session);

    } catch (error) {
      print(`startSession() - Error: ${error}`);
    }
  }

  /**
   * Subscribes to GPS location updates from the paired mobile device.
   * @param session The session object created by the Mobile Kit module.
   */
  private startGPSLocationSubscription(session: any): void {
    // subscribe to GPS location updates
    const subscription = session.startSubscription(
      "gps-location",
      (error) => {
        print(`startGPSLocationSubscription() - GPS Location subscription error: ${error}`);
      }
    );
    subscription.add((response) => {
      print(`startGPSLocationSubscription() - GPS Location subscription response: ${response}`);
      
      // Example response received from mobile app: {"topic":"gps-location","latitude":52.21750581234997,"longitude":5.169571210164693,"horizontal_accuracy":9.08040550891218,"altitude":15.312027490314826,"vertical_accuracy":30.0}
      
      try {
        // Parse the JSON string response
        const locationData = JSON.parse(response);
        
        // Store the parsed values in the class properties
        if (locationData.latitude !== undefined) {
          this.latitude = locationData.latitude;
        }
        if (locationData.longitude !== undefined) {
          this.longitude = locationData.longitude;
        }
        if (locationData.horizontal_accuracy !== undefined) {
          this.horizontalAccuracy = locationData.horizontal_accuracy;
        }
        if (locationData.altitude !== undefined) {
          this.altitude = locationData.altitude;
        }
        if (locationData.vertical_accuracy !== undefined) {
          this.verticalAccuracy = locationData.vertical_accuracy;
        }
        
        // Update the UI with the new location data
        this.newMobileKitDataAvailable();
      } catch (error) {
        print(`startGPSLocationSubscription() - Error parsing GPS location data: ${error}`);
      }
    });
  }

  /**
   * Callback function for when new mobile kit data is available.
   * Updates the content manager with the new mobile kit data.
   */
  private newMobileKitDataAvailable() {
    // Log the data.
    // print('[MobileKitManager.ts] newLocationManagerDataAvailable() -' + 
    //   ' latitude: ' + this.latitude.toFixed(6) + 
    //   ' longitude: ' + this.longitude.toFixed(6) + 
    //   ' horizontalAccuracy: ' + this.horizontalAccuracy.toFixed(0) + 'm' +
    //   ' altitude: ' + this.altitude.toFixed(0) + 'm' +
    //   ' verticalAccuracy: ' + this.verticalAccuracy.toFixed(0) + 'm';

    this.floatingDetailsUIContentManager.updateContent();
  }
}
