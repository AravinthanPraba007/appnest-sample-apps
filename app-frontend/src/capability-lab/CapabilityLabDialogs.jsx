import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  HStack,
} from '@sparrowengg/twigs-react';

export function CapabilityLabDialogs({
  clearAllOpen,
  setClearAllOpen,
  clearLogsOpen,
  setClearLogsOpen,
  activeMetaTitle,
  loading,
  onClearAllConfirm,
  onClearLogsConfirm,
}) {
  return (
    <>
      <Dialog open={clearAllOpen} onOpenChange={setClearAllOpen}>
        <DialogContent
          size="sm"
          className="lab-cap-dialog-content"
          overlayClassName="lab-cap-dialog-overlay"
        >
          <DialogTitle>Reset all lab data?</DialogTitle>
          <DialogDescription>
            Clears every log entry, all demo $db keys, schedule metadata, and the
            demo file. Use “Clear this function’s logs” if you only want to trim the
            current function in the sidebar.
          </DialogDescription>
          <DialogFooter>
            <HStack gap="$2" justify="flex-end">
              <DialogClose asChild>
                <Button color="secondary" variant="outline" size="md">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                color="primary"
                variant="solid"
                size="md"
                disabled={loading}
                onClick={onClearAllConfirm}
              >
                Reset everything
              </Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={clearLogsOpen} onOpenChange={setClearLogsOpen}>
        <DialogContent
          size="sm"
          className="lab-cap-dialog-content"
          overlayClassName="lab-cap-dialog-overlay"
        >
          <DialogTitle>Clear logs for {activeMetaTitle}?</DialogTitle>
          <DialogDescription>
            Removes only run log rows for this log stream ({activeMetaTitle}). Data keys and
            files are untouched.
          </DialogDescription>
          <DialogFooter>
            <HStack gap="$2" justify="flex-end">
              <DialogClose asChild>
                <Button color="secondary" variant="outline" size="md">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                color="primary"
                variant="solid"
                size="md"
                disabled={loading}
                onClick={onClearLogsConfirm}
              >
                Clear logs
              </Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
