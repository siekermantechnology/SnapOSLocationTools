/**
 * FloatingDetailsUIPresentationManager - Manages the visibility of the floating details UI
 * 
 * This component manages the visibility of the floating details UI frame and handles
 * the close button callback to hide it.
 * 
 * Key Features:
 * - Close button callback to hide the floating details UI frame
 */

@component
export class FloatingDetailsUIPresentationManager extends BaseScriptComponent {

  /** The Frame that shows detailed information when Details button is pressed */
  @input
  public floatingDetailsUIFrame: SceneObject;

  /**
   * Callback function for UI Kit Close Button press events
   * This function is assigned as a callback to the Close Button in Lens Studio
   */
  private closeButtonPressed() {
    // Disable the floating detail UI frame when Close button is pressed
    if (this.floatingDetailsUIFrame) {
      this.floatingDetailsUIFrame.enabled = false;
    } else {
      print("closeButtonPressed() - Warning: floatingDetailsUIFrame is not assigned.");
    }
  }
}
