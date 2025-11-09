/**
 * HandLockedUIPresentationManager - A hand-tracked UI positioning component for Snap Spectacles
 * 
 * This component manages the positioning and visibility of a UI that appears and follows 
 * the user's left hand when it's tracked and facing the camera. The UI is positioned 
 * relative to the hand's position using smooth interpolation for natural movement.
 * 
 * Key Features:
 * - Hand orientation-based activation (shows when left hand is tracked and facing camera)
 * - Smooth positioning that follows hand movement
 * - Billboard rotation to always face the user
 * - Editor compatibility for testing
 * 
 * Strongly based on https://github.com/Snapchat/Spectacles-Sample/blob/main/AI%20Music%20Gen/Assets/Scripts/HandDockedMenu.ts
 */

import { SIK } from "SpectaclesInteractionKit.lspkg/SIK";
import WorldCameraFinderProvider from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider";
import { FloatingDetailsUIContentManager } from "./FloatingDetailsUIContentManager";

@component
export class HandLockedUIPresentationManager extends BaseScriptComponent {

  /** The Frame that contains the UI elements, which is positioned relative to the hand */
  @input
  public handLockedUIBackPlate: SceneObject;
  
  /** The Content Manager that manages the content displayed in the floating details UI */
  @input
  public floatingDetailsUIContentManager: FloatingDetailsUIContentManager;

  /** The Frame that shows detailed information when Details button is pressed */
  @input
  public floatingDetailsUIFrame: SceneObject;

  /** Reference to the left hand for tracking orientation and position */
  private leftHand = SIK.HandInputData.getHand("left");
  
  /** Camera provider for positioning and billboard calculations */
  private mCamera = WorldCameraFinderProvider.getInstance();

  /**
   * Component initialization - sets up event handlers and initial state
   * Uses a delayed callback to ensure proper initialization timing
   */
  onAwake() {
    // Set up the main update loop
    this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
    
    // Better initialization with delay for proper setup
    // This ensures all systems are ready before showing/hiding the UI
    let delay = this.createEvent("DelayedCallbackEvent");
    delay.bind(() => {
      if (global.deviceInfoSystem.isEditor()) {
        // In editor, always show the UI
        this.handLockedUIBackPlate.enabled = true;
      } else {
        // On device, start hidden and let hand tracking control visibility
        this.handLockedUIBackPlate.enabled = false;
      }
    });
    delay.reset(0.25); // 250ms delay for proper initialization
  }

  /**
   * Main update loop - called every frame
   * Handles UI positioning and activation logic
   */
  onUpdate() {
    this.positionUI();           // Update UI position based on hand tracking
    this.checkForUIActivation(); // Show/hide UI based on hand position and orientation
  }

  /**
   * Positions the UI relative to the hand and applies smooth movement
   * In editor: positions UI in view of the camera for testing
   * On device: positions UI relative to left hand
   */
  private positionUI() {
    // Check if the handLockedUIBackPlate is assigned
    if (!this.handLockedUIBackPlate) {
        print("positionUI() - Warning: handLockedUIBackPlate is not assigned.");
        return;
    }
    
    let currentWorldPosition = this.handLockedUIBackPlate.getTransform().getWorldPosition();
    let targetWorldPosition: vec3;
    
    if (global.deviceInfoSystem.isEditor()) {
      // In editor, position UI a meter back (-100 in Lens Studio units) from the origin, so it is in view when at start.
      targetWorldPosition = new vec3(0, 0, -100);
    } else {
      // On device, position relative to the pinky knuckle, a bit to the right of it.
      let pinkyKnucklePosition = this.leftHand.pinkyKnuckle.position;
      let pinkyKnuckleRightVector = this.leftHand.pinkyKnuckle.right;
      targetWorldPosition = pinkyKnucklePosition.add(pinkyKnuckleRightVector.uniformScale(7));
    }
    
    // Apply smooth positioning using linear interpolation.
    // This prevents jittery movement and creates natural following behavior
    let lerpedTargetWorldPosition = vec3.lerp(currentWorldPosition, targetWorldPosition, 0.2);
    this.handLockedUIBackPlate.getTransform().setWorldPosition(lerpedTargetWorldPosition);
    
    // Billboard rotation to always face the user.
    let directionToCamera = this.mCamera.getWorldPosition().sub(lerpedTargetWorldPosition).normalize();
    this.handLockedUIBackPlate.getTransform().setWorldRotation(quat.lookAt(directionToCamera, vec3.up()));
  }

  /**
   * Checks if the UI should be shown or hidden.
   * In editor: always shows UI
   * On device: shows when hand is tracked and facing camera
   */
  private checkForUIActivation() {
    // In editor, always show the UI
    if (global.deviceInfoSystem.isEditor()) {
      this.handLockedUIBackPlate.enabled = true;
      return;
    }

    // Device logic: Show UI when hand is tracked and facing the camera
    if (this.leftHand.isTracked() && this.leftHand.isFacingCamera()) {
      this.handLockedUIBackPlate.enabled = true;
    } else {
      this.handLockedUIBackPlate.enabled = false;
    }
  }

  /**
   * Callback function for UI Kit Details Button press events
   * This function is assigned as a callback to the Details Button in Lens Studio
   */
  private detailsButtonPressed() {
    // Enable the floating details UI frame when Details button is pressed
    if (this.floatingDetailsUIFrame) {
      this.floatingDetailsUIFrame.enabled = true;
      this.floatingDetailsUIContentManager.updateContent();
    } else {
      print("detailsButtonPressed() - Warning: floatingDetailsUIFrame is not assigned.");
    }
  }
}
