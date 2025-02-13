import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { SearchResult } from '@kodality-web/core-util';
import { finalize, Observable } from 'rxjs';
import cytoscape, { Core, EdgeDefinition, ElementsDefinition, NodeDefinition } from 'cytoscape';
import klay from 'cytoscape-klay';
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

    cytoscape.use(klay);

    const options = {
      name: 'klay',
      nodeDimensionsIncludeLabels: true,
      fit: true, 
      klay: {
        spacing: 25,
        edgeSpacingFactor: 0.5,
        direction: 'DOWN',
        borderSpacing: 20,
        compactComponents: false,
        separateConnectedComponents: true,
        nodeLayering: 'NETWORK_SIMPLEX',
        nodePlacement: 'BRANDES_KOEPF',
        thoroughness: 10
      }
    };

    this.cy = cytoscape({
      container: this.cyContainer.nativeElement,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'background-color': '#e0218a',
            'color': '#ffffff',
            'text-valign': 'center',
            'text-halign': 'center',
            'width': 50,
            'height': 50,
            'font-size': '10px'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#e0218a',
            'target-arrow-color': '#e0218a',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
          }
        },
      ]
    });

    this.cy.layout(options).run();

    this.cy.on('tap', 'node', (event) => {
      const nodeId = event.target.id();
      this.onNodeClick(nodeId);
    });
  }

  private onNodeClick(nodeId: string): void {
    const clickedNode = this.cy.getElementById(nodeId);

    this.cy.elements().style({ 'background-color': '#e0218a', 'line-color': '#e0218a', 'target-arrow-color': '#e0218a' });

    clickedNode.style({ 'background-color': '#ffd700' });

    const neighborhood = clickedNode.closedNeighborhood();

    neighborhood.forEach(ele => {
      if (ele.isEdge() && ele.source().id() === nodeId) {
        ele.style({
          'line-color': '#ff9f1a',
          'target-arrow-color': '#ff9f1a'
        });

        ele.target().style({
          'background-color': '#ff9f1a'
        });
      }
    });

    const outgoingElements = neighborhood.filter(ele => ele.isEdge() && ele.source().id() === nodeId);
    this.cy.fit(clickedNode.union(outgoingElements), 50);
  }

  private generateGraphElements(structureDefinitions: StructureDefinition[]): ElementsDefinition {
    const nodes: NodeDefinition[] = [];
    const edges: EdgeDefinition[] = [];
  
    const codeToStructureMap = new Map(
      structureDefinitions.map(sd => [sd.url, sd])
    );
  
    structureDefinitions.filter(x => x.contentFormat === 'json').forEach(sd => {
      nodes.push({
        data: {
          id: sd.id.toString(),
          label: sd.code
        }
      });
    });
  
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
