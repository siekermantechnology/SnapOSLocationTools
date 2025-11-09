/**
 * HandLockedUIContentManager - Manages the content displayed in the hand-locked UI
 * 
 * This component manages all content updates for the hand-locked UI, including GPS status
 * indicators, location text elements, and compass rotation. It synchronizes the UI display
 * with location data from the LocationManager, providing real-time feedback about GPS status,
 * accuracy, heading, and location source.
 * 
 * Key Features:
 * - GPS status indicator with color-coded images (white/red/blue/yellow/green)
 * - Real-time location text updates (source, accuracy, heading)
 * - Compass rotation synchronized with heading direction
 * - Efficient updates that only refresh when location source changes
 */

import { LocationManager } from "./LocationManager";

@component
export class HandLockedUIContentManager extends BaseScriptComponent {

  /** Reference to the LocationManager to get location data */
  @input
  public locationManager: LocationManager;

  /** Image for empty/unknown GPS status (white) */
  @input
  public gpsStatusWhiteImage: Image;
  /** Image for NOT_AVAILABLE GPS status (red) */
  @input
  public gpsStatusRedImage: Image;
  /** Image for GNSS_RECEIVER GPS status (blue) */
  @input
  public gpsStatusBlueImage: Image;
  /** Image for WIFI_POSITIONING_SYSTEM GPS status (yellow) */
  @input
  public gpsStatusYellowImage: Image;
  /** Image for FUSED_LOCATION GPS status (green) */
  @input
  public gpsStatusGreenImage: Image;

  /** Text component to display the location source */
  @input
  public sourceValueText: Text;

  /** Text component to display the horizontal accuracy */
  @input
  public accuracyValueText: Text;

  /** Image for compass */
  @input
  public compassImage: Image;

  /** Text component to display the heading */
  @input
  public headingValueText: Text;

  /** Store the last known location source to avoid unnecessary updates */
  private lastLocationSource: string = '';

  /**
   * Component initialization - sets up the update loop for content
   */
  onAwake() {
    // Set up the main update loop for content updates
    this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
  }

  /**
   * Main update loop - called every frame
   * Handles content updates like GPS status and text elements
   */
  onUpdate() {
    this.updateGPSStatusIndicator(); // Update GPS status indicator
    this.updateLocationTextElements(); // Update location text elements
    this.updateCompassRotation(); // Update compass rotation based on heading
  }

  /**
   * Updates the GPS status indicator by enabling/disabling the appropriate image
   * Only updates when the location source changes to avoid unnecessary updates
   */
  private updateGPSStatusIndicator() {
    if (!this.locationManager) return;

    const currentLocationSource = this.locationManager.locationSource;
    
    // Only update if the location source has changed
    if (currentLocationSource !== this.lastLocationSource) {
      this.lastLocationSource = currentLocationSource;

      // Disable all GPS status images first
      this.disableAllGPSStatusImages();

      // Enable the appropriate image based on the location source
      const targetImage = this.getGPSStatusImage(currentLocationSource);
      if (targetImage) {
        targetImage.sceneObject.enabled = true;
        // print('updateGPSStatusIndicator() - Enabled GPS status image for: ' + currentLocationSource);
      } else {
        print('updateGPSStatusIndicator() - Warning: No image found for GPS status: ' + currentLocationSource);
      }
    }
  }

  /**
   * Disables all GPS status images
   */
  private disableAllGPSStatusImages() {
    if (this.gpsStatusWhiteImage) this.gpsStatusWhiteImage.sceneObject.enabled = false;
    if (this.gpsStatusRedImage) this.gpsStatusRedImage.sceneObject.enabled = false;
    if (this.gpsStatusBlueImage) this.gpsStatusBlueImage.sceneObject.enabled = false;
    if (this.gpsStatusYellowImage) this.gpsStatusYellowImage.sceneObject.enabled = false;
    if (this.gpsStatusGreenImage) this.gpsStatusGreenImage.sceneObject.enabled = false;
  }

  /**
   * Updates the location text elements with current data from LocationManager
   * Called every frame to ensure text stays synchronized with location data
   */
  private updateLocationTextElements() {
    if (!this.locationManager) return;

    // Update source text
    if (this.sourceValueText) {
      this.sourceValueText.text = LocationManager.getShortLocationSource(this.locationManager.locationSource);
    }

    // Update accuracy text (horizontal accuracy in meters)
    if (this.accuracyValueText) {
      this.accuracyValueText.text = this.locationManager.horizontalAccuracy.toFixed(0) + 'm';
    }

    // Update heading text (in degrees)
    if (this.headingValueText) {
      this.headingValueText.text = this.locationManager.heading.toFixed(0) + '°';
    }
  }

  /**
   * Updates the compass image rotation based on the current heading
   * Rotates the compass around the Z-axis to point in the direction of travel
   */
  private updateCompassRotation() {
    if (!this.locationManager || !this.compassImage) return;

    // Convert heading from degrees to radians
    const headingRadians = this.locationManager.heading * Math.PI / 180;
    
    // Set the rotation around Z-axis (yaw) using setLocalRotation
    const rotationQuat = quat.angleAxis(headingRadians, vec3.forward());
    this.compassImage.sceneObject.getTransform().setLocalRotation(rotationQuat);
  }

  /**
   * Returns the appropriate image for the given GPS location source
   * @param locationSource The location source string from LocationManager
   * @returns Image component for the GPS status
   */
  private getGPSStatusImage(locationSource: string): Image {
    switch (locationSource) {
      case '': // Empty string
        return this.gpsStatusWhiteImage;
      case 'NOT_AVAILABLE':
        return this.gpsStatusRedImage;
      case 'GNSS_RECEIVER':
        return this.gpsStatusBlueImage;
      case 'WIFI_POSITIONING_SYSTEM':
        return this.gpsStatusYellowImage;
      case 'FUSED_LOCATION':
        return this.gpsStatusGreenImage;
      default:
        return this.gpsStatusWhiteImage; // Default to white for unknown states
    }
  }
}
