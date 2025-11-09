/**
 * LocationManager - Manages device location tracking and orientation data for Snap Spectacles
 * 
 * This component provides access to the device's geographic location and compass heading using
 * the Lens Studio GeoLocation API. It continuously tracks the user's position with high accuracy
 * (Navigation mode), updates location data every second, and processes orientation updates for
 * compass heading. The component stores location data including latitude, longitude, altitude,
 * accuracy metrics, and heading, then notifies content managers when new data is available.
 * 
 * Key Features:
 * - High-accuracy location tracking using Navigation accuracy mode
 * - Continuous location updates every second via repeating events
 * - Real-time compass heading from orientation sensor
 * - Location source tracking (GNSS, WiFi, Fused, etc.)
 * - Editor compatibility with heading inversion fix
 * - Utility methods for location source formatting and angle conversion
 */

import { FloatingDetailsUIContentManager } from "./FloatingDetailsUIContentManager";

// Import the required Raw Location Module from Lens Studio
require('LensStudio:RawLocationModule');

@component
export class LocationManager extends BaseScriptComponent {

  /** Reference to FloatingDetailsUIContentManager component */
  @input
  floatingDetailsUIContentManager!: FloatingDetailsUIContentManager

  /** Properties to store the user's location data */
  locationSource: string = '';        // Source of location data (NOT_AVAILABLE, GNSS_RECEIVER, WIFI_POSITIONING_SYSTEM, FUSED_LOCATION)
  latitude: number = 0;               // Latitude in degrees
  longitude: number = 0;              // Longitude in degrees
  horizontalAccuracy: number = 0;     // Accuracy of lat/long in meters
  altitude: number = 0;               // Altitude in meters
  verticalAccuracy: number = 0;       // Accuracy of altitude in meters
  heading: number = 0;                // Heading in degrees

  /** Service that provides access to device location. */
  private locationService: LocationService;
  
  /** Event to repeatedly update user location. */
  private repeatProcessGeoPositionEvent: DelayedCallbackEvent;

  onAwake() {
    this.createEvent('OnStartEvent').bind(() => {
      this.configureLocationManager();
    });
  }
  
  /**
   * Sets up the location service with high accuracy (Navigation) for precise location tracking,
   * registers callbacks for orientation updates, and creates a repeating event to continuously
   * update the user's geographic position
   */
  private configureLocationManager() {
    // print('configureLocationManager()');

    // Initialize a LocationService 
    // (https://developers.snap.com/lens-studio/api/lens-scripting/classes/Built-In.LocationService.html)
    this.locationService = GeoLocation.createLocationService();

    // Set highest accuracy level (Navigation) for precise location tracking 
    // (https://developers.snap.com/lens-studio/api/lens-scripting/enums/Built-In.GeoLocationAccuracy.html)
    this.locationService.accuracy = GeoLocationAccuracy.Navigation;

    // Register the callback for orientation (compass heading) updates.
    this.locationService.onNorthAlignedOrientationUpdate.add(
      (northAlignedOrientationQuaternion) => this.processNorthAlignedOrientationUpdate(northAlignedOrientationQuaternion)
    );

    // Create and configure the repeating event for reading the GeoPosition from the LocationService.
    this.repeatProcessGeoPositionEvent = this.createEvent('DelayedCallbackEvent');
    this.repeatProcessGeoPositionEvent.bind(() => {
      this.processGeoPosition();
    });
    // Then trigger the first event.
    this.repeatProcessGeoPositionEvent.reset(0.0);
  }

  /**
   * Updates the user's location by requesting the current position from the LocationService,
   * stores the received location data (latitude, longitude, altitude, accuracy),
   * and schedules the next location update after 1 second.
   */
  private processGeoPosition() {
    // print('processGeoPosition()');

    // Asynchronously request the current GeoPosition from the LocationService.
    this.locationService.getCurrentPosition(
      (geoPosition) => {
        // Store all location data from the position object
        this.locationSource = geoPosition.locationSource;
        this.latitude = geoPosition.latitude;
        this.longitude = geoPosition.longitude;
        this.horizontalAccuracy = geoPosition.horizontalAccuracy;
        this.altitude = geoPosition.altitude;
        this.verticalAccuracy = geoPosition.verticalAccuracy;

        // Notify that new location data is available.
        this.newLocationManagerDataAvailable();
      },
      (error) => {
        print('processGeoPosition() error: ' + error);
      }
    );

    // Schedule the next location update.
    this.repeatProcessGeoPositionEvent.reset(1.0);
  }

  /**
   * Processes heading updates from the orientation sensor, calculates the heading in degrees
   * from the north-aligned quaternion.
   * @param northAlignedOrientationQuaternion The quaternion representing north-aligned orientation
   */
  private processNorthAlignedOrientationUpdate(northAlignedOrientationQuaternion) {
    // print('processNorthAlignedOrientationUpdate()');

    // Calculate the heading in degrees from the north-aligned quaternion.
    this.heading = GeoLocation.getNorthAlignedHeading(northAlignedOrientationQuaternion);

    // Fix for Lens Studio editor bug where heading is inverted during simulation. This only happens in editor.
    // On actual Spectacles device this fix is not needed. 
    // Current as of Lens Studio 5.15.
    if (global.deviceInfoSystem.isEditor()) {
      this.heading = -this.heading;
    }

    // Notify that new data is available.
    this.newLocationManagerDataAvailable();
  }

  /**
   * Callback function for when new location data is available.
   * Updates the content manager with the new location data.
   */
  private newLocationManagerDataAvailable() {
    // Log the data.
    // print('newLocationManagerDataAvailable() -' + 
    //   ' locationSource: ' + this.locationSource + 
    //   ' latitude: ' + this.latitude.toFixed(6) + 
    //   ' longitude: ' + this.longitude.toFixed(6) + 
    //   ' horizontalAccuracy: ' + this.horizontalAccuracy.toFixed(0) + 'm' +
    //   ' altitude: ' + this.altitude.toFixed(0) + 'm' +
    //   ' verticalAccuracy: ' + this.verticalAccuracy.toFixed(0) + 'm' +
    //   ' heading: ' + this.heading.toFixed(0) + '°');

    // Notify the content manager to update the UI with the new location data.
    if (this.floatingDetailsUIContentManager) {
      this.floatingDetailsUIContentManager.updateContent();
    }
  }

  /**
   * Converts radians to degrees
   * Static method that can be accessed from other classes via LocationManager.radiansToDegrees()
   * @param radians The angle in radians to convert
   * @returns The angle in degrees
   */
  static radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  /**
   * Converts long location source strings to shorter, user-friendly versions
   * Static method that can be accessed from other classes via LocationManager.getShortLocationSource()
   * @param locationSource The location source string from LocationManager
   * @returns Short version of the location source string
   */
  static getShortLocationSource(locationSource: string): string {
    switch (locationSource) {
      case 'NOT_AVAILABLE':
        return 'Not available';
      case 'GNSS_RECEIVER':
        return 'GNSS / GPS';
      case 'WIFI_POSITIONING_SYSTEM':
        return 'WiFi';
      case 'FUSED_LOCATION':
        return 'Fused';
      case '': // Empty string
        return 'Unknown';
      default:
        return 'Unknown';
    }
  }
}