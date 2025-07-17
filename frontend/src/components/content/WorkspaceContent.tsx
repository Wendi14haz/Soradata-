
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { FolderOpen, Plus, FileText, BarChart3, Calendar, Trash2 } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  fileCount: number;
  analysisCount: number;
}

export const WorkspaceContent = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const createNewProject = () => {
    if (!newProjectName.trim()) return;

    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName,
      description: newProjectDescription || 'Tidak ada deskripsi',
      createdAt: new Date(),
      fileCount: 0,
      analysisCount: 0
    };

    setProjects(prev => [newProject, ...prev]);
    setNewProjectName('');
    setNewProjectDescription('');
    setIsCreatingProject(false);
  };

  const deleteProject = (projectId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setProjects(prev => prev.filter(project => project.id !== projectId));
  };

  return (
    <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`border-b p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Proyek</h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Kelola project dan file analisis Anda</p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setIsCreatingProject(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Project Baru
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {isCreatingProject && (
          <Card className={`mb-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Buat Project Baru
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Nama Project
                </label>
                <Input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Masukkan nama project..."
                  className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Deskripsi (Opsional)
                </label>
                <Input
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Masukkan deskripsi project..."
                  className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={createNewProject}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!newProjectName.trim()}
                >
                  Buat Project
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreatingProject(false);
                    setNewProjectName('');
                    setNewProjectDescription('');
                  }}
                  className={`${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {projects.length === 0 && !isCreatingProject ? (
          <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} max-w-md`}>
            <CardContent className="p-8 text-center">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <FolderOpen className={`w-10 h-10 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Belum Ada Project
              </h3>
              <p className={`mb-6 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Buat project baru untuk mengorganisir analisis data dan file Anda dengan lebih baik.
              </p>
              <Button 
                onClick={() => setIsCreatingProject(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Buat Project Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {projects.map(project => (
              <Card 
                key={project.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg group ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <FolderOpen className={`w-5 h-5 flex-shrink-0 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                        <h4 className={`font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {project.name}
                        </h4>
                      </div>
                      
                      <p className={`text-sm mb-3 line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {project.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs">
                        <div className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          <Calendar className="w-3 h-3" />
                          <span>
                            {project.createdAt.toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <div className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          <FileText className="w-3 h-3" />
                          <span>{project.fileCount} file</span>
                        </div>
                        
                        <div className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          <BarChart3 className="w-3 h-3" />
                          <span>{project.analysisCount} analisis</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => deleteProject(project.id, e)}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
