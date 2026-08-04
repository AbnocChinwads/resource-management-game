let knownResources = new Set();
let knownStorage = new Set();

export async function checkDiscovery(data) {
  const resources = data.resources;
  const storage = data.storage;

  const currentKnownResources = new Set(
    resources.map((r) => r.resource_type_id),
  );

  const currentKnownStorage = new Set(storage.map((s) => s.storage_category));

  const resourceDiscoveryChanged =
    currentKnownResources.size !== knownResources.size ||
    [...currentKnownResources].some((id) => !knownResources.has(id));

  const storageDiscoveryChanged =
    currentKnownStorage.size !== knownStorage.size ||
    [...currentKnownStorage].some((category) => !knownStorage.has(category));

  if (resourceDiscoveryChanged) {
    await refreshResources();
    await refreshRecipes();

    knownResources = currentKnownResources;
  }

  if (storageDiscoveryChanged) {
    await refreshStorage();

    knownStorage = currentKnownStorage;
  }
}
