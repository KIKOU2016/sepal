package org.openforis.sepal.sceneretrieval.provider

import org.openforis.sepal.sceneretrieval.SceneRetrievalListener
import org.slf4j.Logger
import org.slf4j.LoggerFactory

import java.util.concurrent.CopyOnWriteArrayList

import static org.openforis.sepal.scenesdownload.DownloadRequest.SceneStatus.*

interface SceneDownloadCoordinator {

    public void withScene(SceneRequest request, double sizeInBytes, Closure closure)
}

class FileSystemSceneDownloadCoordinator implements SceneDownloadCoordinator {
    private static final Logger LOG = LoggerFactory.getLogger(this)
    private final SceneRepository sceneRepository
    private final List<SceneRetrievalListener> listeners = new CopyOnWriteArrayList<>()

    FileSystemSceneDownloadCoordinator(SceneRepository sceneRepository) {
        this.sceneRepository = sceneRepository
    }

    void register(SceneRetrievalListener... listeners) {
        listeners.each {
            this.listeners.add(it)
        }
    }



    void withScene(SceneRequest request, double sizeInBytes, Closure closure) {
        try {
            notifyListeners(request, DOWNLOADING)
            closure(new DefaultScene(request, sceneRepository))
            notifyListeners(request, DOWNLOADED)
        } catch (Exception e) {
            notifyListeners(request, FAILED)
            LOG.error("Failed to download scene $request", e)
        }
    }

    private List<SceneRetrievalListener> notifyListeners(SceneRequest request, status) {
        listeners.each {
            it.sceneStatusChanged(request, status)
        }
    }

}
