"use client"
import { useState } from "react"
import { Dialog, RightDialogContent } from "@/components/ui/right-dialog"
import { DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { defaultModalConfig } from "@/lib/modal-config"

// Example component showing how to use the global modal configuration
export default function ModalUsageExample() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Modal Usage Examples</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Right Side Modal (Default)</h3>
          <Button onClick={() => setIsOpen(true)}>
            Open Right Side Modal
          </Button>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Configuration Options</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Position:</strong> 'center' | 'right'</p>
            <p><strong>Width:</strong> 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'</p>
            <p><strong>Height:</strong> 'auto' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'</p>
          </div>
        </div>
      </div>

      {/* Example Right Side Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <RightDialogContent 
          config={{ 
            position: 'right', 
            width: '4xl', 
            height: 'full' 
          }}
          className="p-0 flex flex-col"
        >
          <div className="p-6 border-b bg-white sticky top-0 z-10">
            <DialogTitle className="text-xl font-semibold">Example Right Side Modal</DialogTitle>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              <p>This modal slides in from the right side, just like the Metronic theme.</p>
              <p>You can configure the position, width, and height using the config prop.</p>
              <p>The header and footer are sticky, and the middle content scrolls.</p>
            </div>
          </div>
          
          <div className="p-6 border-t bg-gray-50 sticky bottom-0 z-10">
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsOpen(false)}>
                Save
              </Button>
            </div>
          </div>
        </RightDialogContent>
      </Dialog>
    </div>
  )
}
