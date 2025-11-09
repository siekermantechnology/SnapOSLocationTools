/**
 * FloatingDetailsUIContentManager - Manages the content displayed in the floating details UI
 * 
 * This component manages all content updates for the floating details UI, including mobile kit
 * location information, location manager data, button states, and map pin visualization. It 
 * synchronizes the UI display with location data from both MobileKitManager and LocationManager, 
 * providing real-time feedback about GPS coordinates, accuracy, altitude, and heading. The 
 * component handles different states including editor mode, disabled mobile kit, and active 
 * location tracking.
 * 
 * Key Features:
 * - Real-time location text updates from both MobileKitManager and LocationManager
 * - Dynamic button state management based on mobile kit availability
 * - Map pin visualization that updates with mobile kit location
 * - Editor compatibility with appropriate fallback messages
 * - State-aware UI updates (editor/disabled/no data/active)
 */

import { RectangleButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/RectangleButton";
import { MapComponent } from "../MapComponent/Scripts/MapComponent";
import { MapPin } from "../MapComponent/Scripts/MapPin";
import { LocationManager } from "./LocationManager";
import { MobileKitManager } from "./MobileKitManager";

@component
export class FloatingDetailsUIContentManager extends BaseScriptComponent {

  /** MapComponent for displaying the map and managing map pins */
  @input 
  public mapComponent: MapComponent;

  /** Reference to the LocationManager to get location data */
  @input
  public locationManager: LocationManager;
  /** Text component to display the location data (source, coordinates, accuracy, altitude, heading) */
  @input
  public locationDataText!: Text

  /** SceneObject for the mobile kit manager component */
  @input
  public mobileKitManagerSceneObject: SceneObject;
  /** Reference to the MobileKitManager to get mobile kit location data */
  @input
  public mobileKitManager: MobileKitManager;  
  /** Button component for starting the mobile kit */
  @input
  public startMobileKitButton: RectangleButton;
  /** Text component for the start mobile kit button */
  @input  
  public startMobileKitButtonText!: Text
  /** Text component to display the mobile kit location data (coordinates, accuracy, altitude) */
  @input
  public mobileKitText!: Text

  /** Reference to the map pin showing the mobile kit location */
  private mobileKitPin: MapPin = null;

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      this.onStart();
    });
  }

  onStart() {
    this.updateContent();
  }

  public updateContent() {
    this.updateLocationText();
    this.updateMobileKitText();
    this.updateMobileKitPin();
  }

  /**
   * Updates the location text with current location data.
   * Displays source, latitude, longitude, accuracy, altitude, and heading information.
   */
  private updateLocationText() {
    if (!this.locationManager || !this.locationDataText) {
      return;
    }

    this.locationDataText.text = 
      'Source: ' + this.locationManager.locationSource + 
      '\nLatitude: ' + this.locationManager.latitude.toFixed(6) + 
      '\nLongitude: ' + this.locationManager.longitude.toFixed(6) + 
      '\nHorizontal Accuracy: ' + this.locationManager.horizontalAccuracy.toFixed(0) + 'm' +
      '\nAltitude: ' + this.locationManager.altitude.toFixed(0) + 'm' +
      '\nVertical Accuracy: ' + this.locationManager.verticalAccuracy.toFixed(0) + 'm' +
      '\nHeading: ' + this.locationManager.heading.toFixed(0) + '°';
  }

  /**
   * Updates the mobile kit text and button states based on the current mobile kit status.
   * Handles different states: editor mode, disabled mobile kit, no data available, and active tracking.
   * Also updates button colors and manages map pin visibility accordingly.
   */
  private updateMobileKitText() {
    if (global.deviceInfoSystem.isEditor()) {
      this.mobileKitText.text = "Mobile Kit unavailable in editor";
      this.startMobileKitButton.inactive = true;
      this.startMobileKitButtonText.textFill.color = new vec4(0.5, 0.5, 0.5, 1); // Light grey color
      this.removeMobileKitPin();
    } else if (!this.mobileKitManagerSceneObject.enabled) {
      this.mobileKitText.text = "Mobile Kit available on device";
      this.startMobileKitButton.inactive = false;
      this.startMobileKitButtonText.textFill.color = new vec4(1, 1, 1, 1); // White color
      this.removeMobileKitPin();
    } else if (this.mobileKitManager.latitude === 0 && this.mobileKitManager.longitude === 0) {
      this.mobileKitText.text = "No Mobile Kit data";
      this.startMobileKitButton.inactive = true;
      this.startMobileKitButtonText.textFill.color = new vec4(0.5, 0.5, 0.5, 1); // Light grey color
      this.removeMobileKitPin();
    } else {
      this.mobileKitText.text = 
        'Latitude: ' + this.mobileKitManager.latitude.toFixed(6) + 
        '\nLongitude: ' + this.mobileKitManager.longitude.toFixed(6) + 
        '\nHorizontal Accuracy: ' + this.mobileKitManager.horizontalAccuracy.toFixed(0) + 'm' +
        '\nAltitude: ' + this.mobileKitManager.altitude.toFixed(0) + 'm' +
        '\nVertical Accuracy: ' + this.mobileKitManager.verticalAccuracy.toFixed(0) + 'm';
      this.startMobileKitButton.inactive = false;
      this.startMobileKitButtonText.textFill.color = new vec4(0.5, 0.5, 0.5, 1); // Light grey color
      this.updateMobileKitPin();
    }
  }

  /**
   * Updates the map pin to show the current mobile kit location.
   * If a pin already exists, it removes it and creates a new one at the updated location.
   */
  private updateMobileKitPin() {
    if (!this.mapComponent) {
      return;
    }

    if (global.deviceInfoSystem.isEditor()) {
      this.removeMobileKitPin();
    } else if (!this.mobileKitManagerSceneObject.enabled) {
      this.removeMobileKitPin();
    } else if (this.mobileKitManager.latitude === 0 && this.mobileKitManager.longitude === 0) {
      this.removeMobileKitPin();
    } else {
      // Remove existing pin if it exists
      if (this.mobileKitPin !== null) {
        this.mapComponent.removeMapPin(this.mobileKitPin);
        this.mobileKitPin = null;
      }

      // Create a new pin at the current location
      this.mobileKitPin = this.mapComponent.createMapPin(this.mobileKitManager.longitude, this.mobileKitManager.latitude);
    }
  }

  /**
   * Removes the mobile kit pin from the map if it exists.
   */
  private removeMobileKitPin() {
    if (this.mobileKitPin !== null && this.mapComponent) {
      this.mapComponent.removeMapPin(this.mobileKitPin);
      this.mobileKitPin = null;
    }
  }

  /**
   * Callback function for the start mobile kit button press event.
   * Enables the mobile kit scene object and updates the content.
   */
  private startMobileKitButtonPressed() {
    this.mobileKitManagerSceneObject.enabled = true;
    this.updateContent();
  }
}
