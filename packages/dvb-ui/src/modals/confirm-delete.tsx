import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button } from "@chakra-ui/react"
import React, { useCallback } from "react"

export default function ConfirmDelete({ children, onDelete, name }: { children: (open: () => void) => JSX.Element, onDelete: () => void, name?: string }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const cancelRef = React.useRef()

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const del = useCallback(() => {
    onDelete();
    close();
  }, [ onDelete ]);

  return (
    <>
      { children(open) }
      <AlertDialog
        isOpen={ isOpen }
        leastDestructiveRef={ cancelRef }
        onClose={ close }
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              { name == null ? 'Delete' : `Delete ${name}` }
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={ cancelRef } onClick={ close }>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={ del } ml={ 3 }>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}