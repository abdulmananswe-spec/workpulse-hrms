import { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import { WebView } from "react-native-webview";

import { useDesignTokens } from "@/hooks/useDesignTokens";
import type { ParsedBranchCoordinates } from "@/lib/branch-coordinates";

type BranchLocationMapProps = {
  branchName: string;
  coordinates: ParsedBranchCoordinates;
};

function buildMapHtml(
  branchName: string,
  coordinates: ParsedBranchCoordinates,
  primaryColor: string,
  bgColor: string,
): string {
  const { latitude, longitude, radiusMeters } = coordinates;
  const safeName = branchName.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      crossorigin=""
    />
    <script
      src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
      crossorigin=""
    ></script>
    <style>
      html, body, #map { height: 100%; margin: 0; background: ${bgColor}; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      try {
        var map = L.map("map", { zoomControl: false }).setView([${latitude}, ${longitude}], 15);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);
        L.marker([${latitude}, ${longitude}]).addTo(map).bindPopup("${safeName}");
        L.circle([${latitude}, ${longitude}], {
          radius: ${radiusMeters},
          color: "${primaryColor}",
          fillColor: "${primaryColor}",
          fillOpacity: 0.15,
        }).addTo(map);
      } catch (error) {
        document.body.innerHTML =
          "<div style='font-family:sans-serif;padding:16px;color:#64748b;'>Unable to load map preview.</div>";
      }
    </script>
  </body>
</html>`;
}

export function BranchLocationMap({ branchName, coordinates }: BranchLocationMapProps) {
  const tokens = useDesignTokens();
  const mapHtml = useMemo(
    () => buildMapHtml(branchName, coordinates, tokens.primary, tokens.backgroundElevated),
    [branchName, coordinates, tokens.primary, tokens.backgroundElevated],
  );

  return (
    <View
      className="mt-6 h-72 overflow-hidden rounded-3xl"
      style={{ borderWidth: 1, borderColor: tokens.border }}
    >
      <WebView
        originWhitelist={["*"]}
        source={{ html: mapHtml }}
        style={{ flex: 1, backgroundColor: tokens.backgroundElevated }}
        startInLoadingState
        renderLoading={() => (
          <View className="flex-1 items-center justify-center" style={{ backgroundColor: tokens.backgroundElevated }}>
            <ActivityIndicator color={tokens.primary} />
          </View>
        )}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
      />
    </View>
  );
}
