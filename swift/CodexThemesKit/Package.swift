// swift-tools-version: 6.2
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "CodexThemesKit",
    platforms: [
        .iOS("26.0"),
        .macOS("26.0"),
    ],
    products: [
        .library(
            name: "CodexThemesKit",
            targets: ["CodexThemesKit"]
        ),
    ],
    targets: [
        .target(
            name: "CodexThemesKit",
            resources: [
                .process("Resources"),
            ]
        ),
        .testTarget(
            name: "CodexThemesKitTests",
            dependencies: ["CodexThemesKit"]
        ),
    ]
)
