#if os(macOS)
import AppKit
import SwiftUI

struct Chrome: NSViewRepresentable {
    func makeNSView(context: Context) -> NSView {
        let view = NSView()
        DispatchQueue.main.async {
            apply(view.window)
        }
        return view
    }

    func updateNSView(_ view: NSView, context: Context) {
        DispatchQueue.main.async {
            apply(view.window)
        }
    }

    private func apply(_ win: NSWindow?) {
        guard let win else {
            return
        }
        win.styleMask.insert(.fullSizeContentView)
        win.titleVisibility = .hidden
        win.titlebarAppearsTransparent = true
        win.titlebarSeparatorStyle = .none
        win.toolbarStyle = .unifiedCompact
        win.isMovableByWindowBackground = true
        win.toolbar?.showsBaselineSeparator = false
    }
}
#endif
