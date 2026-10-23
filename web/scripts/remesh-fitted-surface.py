"""Rebuild a single closed exterior instead of retaining atlas region panels.
Run in an environment with numpy, scipy, scikit-image and trimesh installed.
"""
import json, struct
from pathlib import Path
import numpy as np
import trimesh
from scipy import ndimage
from skimage.measure import marching_cubes

source=Path('work/surface/fitted.glb').read_bytes()
length=struct.unpack_from('<I',source,12)[0]
data=json.loads(source[20:20+length]);binary=source[28+length:]
def attr(index):
    a=data['accessors'][index];view=data['bufferViews'][a['bufferView']]
    dtype={5126:'<f4',5125:'<u4',5123:'<u2'}[a['componentType']]
    width={'VEC3':3,'VEC4':4,'SCALAR':1}[a['type']]
    return np.frombuffer(binary,dtype=dtype,count=a['count']*width,offset=view.get('byteOffset',0)).reshape(-1,width).copy()
p=data['meshes'][0]['primitives'][0]
mesh=trimesh.Trimesh(vertices=attr(p['attributes']['POSITION']),faces=attr(p['indices']).reshape(-1,3),process=True)
print('Before remesh:',len(mesh.vertices),'vertices, watertight:',mesh.is_watertight,flush=True)
# 3.5 mm samples preserve the shoulder silhouette and individual fingers while
# closing atlas panel gaps. Padding prevents clipping the extremities.
pitch=.0035
voxels=mesh.voxelized(pitch=pitch)
occupancy=np.pad(voxels.matrix,3)
occupancy=ndimage.binary_closing(occupancy,iterations=1)
# The source atlas has mouth/region openings. A 3D hole fill alone leaves
# thin hollow panels. Fill closed cross-sections in each direction to recover
# a solid body, keeping the separated A-pose arms as distinct cross-sections.
filled=occupancy.copy()
for axis in range(3):
    source_slices=np.moveaxis(occupancy,axis,0)
    target_slices=np.moveaxis(filled,axis,0)
    for i in range(len(source_slices)):
        target_slices[i] |= ndimage.binary_fill_holes(source_slices[i])
occupancy=ndimage.binary_fill_holes(filled)
labels,count=ndimage.label(occupancy)
sizes=np.bincount(labels.ravel());sizes[0]=0
occupancy=labels==sizes.argmax()
# A sub-voxel filter removes voxel corners; it is not a loose clothing offset.
field=ndimage.gaussian_filter(occupancy.astype(np.float32),.85)
vertices,faces,_,_=marching_cubes(field,.5,spacing=(pitch,pitch,pitch),allow_degenerate=False)
vertices+=voxels.transform[:3,3]-3*pitch
surface=trimesh.Trimesh(vertices=vertices,faces=faces,process=True)
# Gentle non-shrinking smoothing keeps the result compact and continuous.
trimesh.smoothing.filter_taubin(surface,lamb=.45,nu=.5,iterations=12)
# Reject simplification if it changes topology; the full closed mesh is safer
# than a smaller mesh with pinched or non-manifold edges.
compact=surface.simplify_quadric_decimation(face_count=120000)
if compact.is_watertight:
    surface=compact
surface.export('work/surface/remesh.ply',encoding='binary_little_endian')
print('After remesh:',len(surface.vertices),'vertices, watertight:',surface.is_watertight,'components:',len(surface.split()),flush=True)
