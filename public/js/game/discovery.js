let knownResources = new Set();
let knownStorage = new Set();

export function checkDiscovery(data) {
  const currentKnownResources = new Set(
    data.resources.map((r) => r.resource_type_id),
  );

  const currentKnownStorage = new Set(
    data.storage.map((s) => s.storage_category),
  );

  const resourceDiscoveryChanged =
    currentKnownResources.size !== knownResources.size ||
    [...currentKnownResources].some((id) => !knownResources.has(id));

  const storageDiscoveryChanged =
    currentKnownStorage.size !== knownStorage.size ||
    [...currentKnownStorage].some((category) => !knownStorage.has(category));

  const changed = resourceDiscoveryChanged || storageDiscoveryChanged;

  knownResources = currentKnownResources;
  knownStorage = currentKnownStorage;

  return changed;
}
