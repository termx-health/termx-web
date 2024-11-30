import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { SearchResult } from '@kodality-web/core-util';
import { finalize, Observable } from 'rxjs';
import cytoscape, { Core, EdgeDefinition, ElementsDefinition, NodeDefinition } from 'cytoscape';
import { StructureDefinitionService } from 'term-web/modeler/structure-definition/services/structure-definition.service';
import { StructureDefinition } from 'term-web/modeler/_lib';

@Component({
  templateUrl: './structure-definitions-graph.component.html'
})
export class StructureDefinitionsGraphComponent implements OnInit {
  public loading: boolean;
  private cy: Core;

  @ViewChild('cyContainer', { static: true }) public cyContainer: ElementRef;

  public constructor(private structureDefinitionService: StructureDefinitionService) {}

  public ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {
    this.loading = true;
    this.search().subscribe(resp => {
      this.initCytoscape(resp.data);
    });
  }

  private search(): Observable<SearchResult<StructureDefinition>> {
    return this.structureDefinitionService.search().pipe(finalize(() => this.loading = false));
  }

  private initCytoscape(structureDefinitions: StructureDefinition[]): void {
    const elements: ElementsDefinition = this.generateGraphElements(structureDefinitions);

    this.cy = cytoscape({
      container: this.cyContainer.nativeElement,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'background-color': '#007BFF',
            'color': '#ffffff',
            'text-valign': 'center',
            'text-halign': 'center',
            'width': '100%',
            'height': '100%'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#cccccc',
            'target-arrow-color': '#cccccc',
            'target-arrow-shape': 'triangle'
          }
        },
      ],
      layout: {
        name: 'circle',
        //rows: 10
      }
    });
  }

  private generateGraphElements(structureDefinitions: StructureDefinition[]): ElementsDefinition {
    const nodes: NodeDefinition[] = [];
    const edges: EdgeDefinition[] = [];
  
    // Create a map for quick lookup of StructureDefinitions by code
    const codeToStructureMap = new Map(
      structureDefinitions.map(sd => [sd.code, sd])
    );
  
    // Generate nodes
    structureDefinitions.forEach(sd => {
      nodes.push({
        data: {
          id: sd.id.toString(),
          label: sd.code
        }
      });
    });
  
    // Generate edges
    for (const sourceSd of structureDefinitions) {

      if (sourceSd.contentFormat !== 'json') continue;
      const content = JSON.parse(sourceSd.content);

      if (!content || !content.differential || !content.differential.element) continue;

      for (const element of content.differential.element) {
        if (!element.type) continue;

        element.type.forEach(type => {
          const targetCode = type.code;
          if (codeToStructureMap.has(targetCode)) {
            const targetSd = codeToStructureMap.get(targetCode);
            if (targetSd) {
              edges.push({
                data: {
                  source: sourceSd.id.toString(),
                  target: targetSd.id.toString()
                }
              });
            }
          }
        });
      }
    }

    return {
      nodes,
      edges
    };
  }
}
